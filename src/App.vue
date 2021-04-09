<template>
  <Title class="block line-bottom" />
  <Loading v-if="shared.loading" />
  <div :class="{ 'blur': shared.loading }" v-if="personal.firstLoaded">
    <Main class="block" v-if="shared.token" />
    <Login class="block" v-else />
  </div>
  <Info v-if="shared.info" />
</template>

<script>
import Main from "./components/Main.vue";
import Login from "./components/Login.vue";
import Loading from "./components/Loading.vue";
import Title from "./components/Title.vue";
import Info from "./components/Info.vue";
import {
  data,
  loadingTask,
  getStorageValue,
  initializeVariables,
} from "./data.js";

export default {
  name: "App",
  data() {
    return {
      personal: {
        firstLoaded: false
      },
      shared: data.state,
    };
  },
  components: {
    Login,
    Main,
    Loading,
    Title,
    Info,
  },
  mounted() {
    getStorageValue("repo_name", "sync").then((repo) => {
      data.setRepo(repo)
    });
    getStorageValue("branches", "sync").then((branches) => {
      data.setBranches(branches)
    });
    loadingTask(
      initializeVariables()
    ).then(() => {
      this.personal.firstLoaded = true;
    })
  },
};
</script>

<style>
body {
  margin: 0;
}

#app {
  width: 225px;
  font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Helvetica, Arial,
    sans-serif, Apple Color Emoji, Segoe UI emoji;
}

.blur {
  filter: blur(5px);
}

.flex1 {
  flex: 1;
}

.block {
  padding: 12px;
}

.line-bottom {
  border-bottom: 1px solid #d0dfea;
}

p {
  margin: 0;
  font-size: 12px;
}

h2 {
  margin: 0;
  font-weight: 400;
}

.bold {
  font-weight: 600;
}

select {
  padding: 4px;
}

button, select {
  border: 1px solid #d0dfea;
  border-radius: 3px;
  color: #004e8c;
  background: #faf9f8;
  font-size: 14px;
  padding: 4px 8px;
}

select:hover {
  background: #f4faff;
}

button:hover {
  background: #f4faff;
  cursor: pointer;
}

button:active, select:active {
  box-shadow: 0 1px 2px 0 rgba(60, 64, 67, 0.3),
    0 3px 6px 2px rgba(60, 64, 67, 0.15);
}

a {
  color: #0078d4;
}

a:hover {
  color: #004e8c;
}

input {
  border: 1px solid #d0dfea;
  border-radius: 3px;
  transition: all 0.3s;
  height: 16px;
  padding: 4px 8px;
  font-size: 14px;
  outline: none;
  width: calc(100% - 16px);
}

input:focus,
input:hover {
  border-color: #004e8c;
}

.flex-column {
  display: flex;
  flex-direction: column;
}

.flex {
  display: flex;
}

.flex-center {
  justify-content: center;
  align-items: center;
}

.mb-12 {
  margin-bottom: 12px;
}

.space-between {
  justify-content: space-between;
}
</style>
