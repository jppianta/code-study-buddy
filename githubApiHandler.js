function getHeaders(token) {
  return { 'Content-Type': 'application/json', 'Accept': 'application/vnd.github.v3+json', 'Authorization': `token ${token}` }
}

export async function getMainSHA() {
  if (!this.ownerName) {
    await this.getUserInfo();
  }

  return fetch(`https://api.github.com/repos/${this.ownerName}/${this.repo}/branches/main`, {
    method: 'GET',
    headers: getHeaders(this.token)
  })
    .then(resp => resp.json())
    .then(resp => {
      if (resp.commit) {
        return resp.commit.sha;
      }
    })
    .catch(err => console.error(err));
}

function getExtension(language) {
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

export async function updateReference(commitSHA) {
  if (!this.ownerName) {
    await this.getUserInfo();
  }

  return fetch(`https://api.github.com/repos/${this.ownerName}/${this.repo}/git/refs/heads/main`, {
    method: 'PATCH',
    headers: getHeaders(this.token),
    body: JSON.stringify({ sha: commitSHA })
  })
    .then(resp => resp.json())
    .catch(err => console.error(err));
}

export async function createCommit(baseCommitSHA, treeSha, leetCodeTitle) {
  if (!this.ownerName) {
    await this.getUserInfo();
  }

  return fetch(`https://api.github.com/repos/${this.ownerName}/${this.repo}/git/commits`, {
    method: 'POST',
    headers: getHeaders(this.token),
    body: JSON.stringify({ tree: treeSha, message: `Update ${leetCodeTitle} exercies`, parents: [ baseCommitSHA ] })
  })
    .then(resp => resp.json())
    .then(resp => resp.sha)
    .catch(err => console.error(err));
}

export async function createTree(baseCommitSHA, leetCode) {
  if (!this.ownerName) {
    await this.getUserInfo();
  }

  return fetch(`https://api.github.com/repos/${this.ownerName}/${this.repo}/git/trees`, {
    method: 'POST',
    headers: getHeaders(this.token),
    body: JSON.stringify(
      { 
        tree: [
          { 
            type: 'blob',
            mode: '100644',
            content: leetCode.code,
            path: `${leetCode.language}/${leetCode.questionInfo.difficulty}/${leetCode.questionInfo.questionTitle}${getExtension(leetCode.language)}`
          }
        ],
        base_tree: baseCommitSHA
      }
    )
  })
    .then(resp => resp.json())
    .then(resp => resp.sha)
    .catch(err => console.error(err));
}

export async function updateFile(leetCode) {
  const baseSHA = await this.getMainSHA();
  const treeSHA = await this.createTree(baseSHA, leetCode)
  const commitSHA = await this.createCommit(baseSHA, treeSHA, leetCode.questionInfo.questionTitle)
  await this.updateReference(commitSHA)
}

export function getUserInfo() {
  return fetch('https://api.github.com/user', {
    method: 'GET',
    headers: getHeaders(this.token)
  })
    .then(resp => resp.json())
    .then(resp => {
      this.ownerName = resp.login
    })
    .catch(err => console.error(err));
}