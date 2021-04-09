<template>
  <div class="tile flex block line-bottom">
    <img class="avatar" :src="personal.avatar" />
    <h2>{{ personal.name }}</h2>
    <button @click="logout" class="logout flex flex-center">
      <img src="../assets/logout.svg" />
    </button>
  </div>
  <Repo v-if="!shared.repo" />
  <div v-else>
    <div class="block line-bottom flex-column repo-info flex1">
      <div class="flex flex-center mb-12">
        <div class="flex1">
          <h2 class="bold">Repo:</h2>
          <h2>{{ shared.repo }}</h2>
        </div>
        <button @click="changeRepo" class="logout flex flex-center">
          <img src="../assets/logout.svg" />
        </button>
      </div>
      <h2 class="bold">Branch:</h2>
      <select
        v-model="personal.selectedBranch"
        name="branch"
      >
        <option
          v-for="branch in shared.branches"
          :value="branch"
          v-bind:key="branch"
        >
          {{ branch }}
        </option>
      </select>
    </div>
    <div class="block flex-column" v-if="personal.details">
      <div class="question-info mb-12">
        <h2>
          {{ personal.details.questionInfo.questionNumber }}.
          {{ personal.details.questionInfo.questionTitle }}
        </h2>
      </div>
      <div class="flex flex-center question-actions">
        <h2 :class="['flex1', personal.details.questionInfo.difficulty]">
          {{ personal.details.questionInfo.difficulty }}
        </h2>
        <button @click="save">Save</button>
      </div>
    </div>
  </div>
</template>

<script>
import {
  data,
  getDetails,
  getStorageValue,
  loadingTask,
  setStorageValue,
} from "../data.js";
import { githubApiHandler } from "../githubApiHandler.js";
import Repo from "./Repo.vue";

export default {
  name: "App",
  components: {
    Repo,
  },
  data() {
    return {
      personal: {
        details: null,
        name: "",
        avatar: "",
        selectedBranch: "",
      },
      shared: data.state,
    };
  },
  methods: {
    logout() {
      data.logout();
    },
    onSelectBranch() {
      setStorageValue("selected_branch", this.personal.selectedBranch);
      githubApiHandler.branch = this.personal.selectedBranch;
    },
    changeBranch(branch) {
      this.personal.selectedBranch = branch
    },
    changeRepo() {
      data.setRepo("");
      setStorageValue("repo_name", "", "sync");
    },
    save() {
      // eslint-disable-next-line no-undef
      chrome.tabs.query({ currentWindow: true, active: true }, (tabs) => {
        // eslint-disable-next-line no-undef
        chrome.tabs.sendMessage(tabs[0].id, { info: true }, (details) => {
          loadingTask(
            githubApiHandler.updateFile(details).then(() => {
              data.setInfo({ message: "Solution saved!", type: "success" });
            })
          );
        });
      });
    },
  },
  mounted() {
    getStorageValue("selected_branch").then((branch) => {
      console.log(branch);
      if (branch) {
        this.changeBranch(branch);
      }
    });
    loadingTask(
      getDetails()
        .then((details) => (this.personal.details = details))
        .catch(() => console.log("Tab not on Leetcode"))
    ).then(() => {
      loadingTask(
        githubApiHandler.verifyInfo().then(() => {
          this.personal.name = githubApiHandler.ownerName;
          this.personal.avatar = githubApiHandler.avatarUrl;
        })
      );
    });
  },
};
</script>

<style>
.tile {
  height: 24px;
  align-items: center;
}

.tile > h2 {
  flex: 1;
  font-size: 16px;
}

.question-info > h2 {
  font-size: 18px;
}

.question-actions > h2 {
  font-size: 14px;
}

.avatar {
  height: 100%;
  border-radius: 50%;
  margin-right: 12px;
}

.logout > img {
  height: 20px;
}

.logout {
  height: 30px;
  width: 30px;
  border-radius: 50%;
}

.repo-info {
  justify-content: center;
}

.repo-info h2 {
  font-size: 14px;
}

.Easy {
  color: #0b6a0b;
}

.Medium {
  color: #ffaa44;
}

.Hard {
  color: #d13438;
}
</style>
