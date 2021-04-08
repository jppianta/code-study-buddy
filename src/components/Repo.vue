<template>
  <div class='block repo flex-column'>
    <h2>What's your repo?</h2>
    <div class="flex">
      <input v-model="personal.repo" placeholder="Repo name" />
      <button @click="updateRepo">Ok</button>
    </div>
  </div>
</template>

<script>
import { data, loadingTask, setStorageValue } from "../data.js";
import { githubApiHandler } from "../githubApiHandler.js"

export default {
  name: 'Repo',
  data() {
    return {
      personal: {
        repo: ''
      },
      shared: data.state
    }
  },
  methods: {
    updateRepo() {
      if (this.personal.repo !== '') {
        loadingTask(
          githubApiHandler.isValidRepo(this.personal.repo)
            .then(resp => {
              if (resp.status === 'Valid') {
                data.setRepo(this.personal.repo);
                setStorageValue('repo_name', this.personal.repo, 'sync')
              } else {
                data.setInfo({ message: resp.status, type: 'error' })
              }
            })
        );
      }
    },
  }
}
</script>

<style>
.repo > h2 {
  font-weight: 500;
  margin-bottom: 8px;
}

.repo input {
  margin-right: 12px;
}
</style>