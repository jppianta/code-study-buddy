import { data, setStorageValue } from './data';

class GithubApiHandler {
  getHeaders() {
    return { 'Content-Type': 'application/json', 'Accept': 'application/vnd.github.v3+json', 'Authorization': `token ${data.state.token}` }
  }

  getExtension(language) {
    switch (language) {
      case 'C++': return '.cpp';
      case 'JavaScript': return '.js';
      case 'TypeScript': return '.ts';
      case 'Python': return '.py';
      case 'Python3': return '.py';
      case 'Java': return '.java';
      case 'C': return '.c';
    }
  }

  async getUserInfo() {
    const resp = await fetch('https://api.github.com/user', {
      method: 'GET',
      headers: this.getHeaders()
    })
      .then(resp => resp.json())
      .catch(() => {
        data.setInfo({ type: 'error', message: 'Fail to get user info. Should be a network issue. Please, try again later.' })
      })

    this.avatarUrl = resp.avatar_url
    this.ownerName = resp.login
  }

  async verifyInfo() {
    if (!this.ownerName) {
      await this.getUserInfo()
    }
  }

  async isValidRepo(repoName) {
    await this.verifyInfo();

    return fetch(`https://api.github.com/repos/${this.ownerName}/${repoName}`, {
      method: 'GET',
      headers: this.getHeaders()
    })
      .then(resp => {
        switch (resp.status) {
          case 200: return { status: 'Valid' };
          case 404: return { status: 'Repo does not exist. No need for the entire url, just your Github repository name.' }
        }
      })
  }

  async loadBranches() {
    await this.verifyInfo();

    return fetch(`https://api.github.com/repos/${this.ownerName}/${data.state.repo}/branches`, {
      method: 'GET',
      headers: this.getHeaders()
    })
      .then(resp => resp.json())
      .then(resp => {
        const branches = resp.map(branch => branch.name)
        data.setBranches(branches)
        setStorageValue('branches', branches, 'sync')
        this.branch = branches[0];
      })
      .catch(() => {
        data.setInfo({ type: 'error', message: 'Fail to get branches. Should be a network issue. Please, try again later.' })
      })
  }

  async getMainSHA() {
    await this.verifyInfo();

    return fetch(`https://api.github.com/repos/${this.ownerName}/${data.state.repo}/branches/main`, {
      method: 'GET',
      headers: this.getHeaders()
    })
      .then(resp => resp.json())
      .then(resp => {
        if (resp.commit) {
          return resp.commit.sha;
        }
      })
  }

  createBlob(content, path) {
    return {
      type: 'blob',
      mode: '100644',
      content,
      path
    }
  }

  async createTree(baseCommitSHA, details) {
    await this.verifyInfo();

    const assets = details.questionInfo.assets ?
      details.questionInfo.assets
        .map(asset => this.createBlob(asset.content, `${details.platform}/${details.questionInfo.difficulty}/${details.questionInfo.questionTitle}/assets/${asset.name}`)) :
      []

    console.log(assets)

    return fetch(`https://api.github.com/repos/${this.ownerName}/${data.state.repo}/git/trees`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(
        {
          tree: [
            this.createBlob(details.code, `${details.platform}/${details.questionInfo.difficulty}/${details.questionInfo.questionTitle}/${details.language} Solution${this.getExtension(details.language)}`),
            this.createBlob(details.questionInfo.description, `${details.platform}/${details.questionInfo.difficulty}/${details.questionInfo.questionTitle}/README.md`)
          ].concat(assets),
          base_tree: baseCommitSHA
        }
      )
    })
      .then(resp => resp.json())
      .then(resp => resp.sha)
  }

  async createCommit(baseCommitSHA, treeSha, title) {
    await this.verifyInfo();

    return fetch(`https://api.github.com/repos/${this.ownerName}/${data.state.repo}/git/commits`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ tree: treeSha, message: `Update ${title} exercies`, parents: [baseCommitSHA] })
    })
      .then(resp => resp.json())
      .then(resp => resp.sha)
  }

  async updateReference(commitSHA) {
    await this.verifyInfo();

    return fetch(`https://api.github.com/repos/${this.ownerName}/${data.state.repo}/git/refs/heads/main`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: JSON.stringify({ sha: commitSHA })
    })
      .then(resp => resp.json())
  }

  async updateFile(details) {
    const baseSHA = await this.getMainSHA();
    const treeSHA = await this.createTree(baseSHA, details)
    const commitSHA = await this.createCommit(baseSHA, treeSHA, details.questionInfo.questionTitle)
    await this.updateReference(commitSHA)
  }
}

export const githubApiHandler = new GithubApiHandler();