import {
  getMainSHA,
  getUserInfo,
  updateReference,
  createCommit,
  createTree,
  updateFile
} from './githubApiHandler.js';

function getStorage(var_name) {
  return new Promise((res, rej) => {
    chrome.storage.sync.get([var_name], function (result) {
      if (result) {
        res(result[var_name]);
      } else {
        rej();
      }
    });
  })
}

function setStorage(var_name, value) {
  const pair = {};
  pair[var_name] = value;
  chrome.storage.sync.set(pair);
}

function clearStorage() {
  chrome.storage.sync.clear();
  chrome.storage.local.clear();
}

const App = {
  data() {
    return {
      loaded: false,
      needLogin: true,
      repo: '',
      deviceCode: '',
      userCode: '',
      token: '',
      ownerName: ''
    }
  },
  methods: {
    logout() {
      this.needLogin = true;
      this.deviceCode = '';
      this.userCode = '';
      this.token = '';
      clearStorage();
    },
    updateRepo() {
      setStorage('repo_name', this.repo)
    },
    showCode() {
      fetch('https://leetcode-repo-manager.herokuapp.com/code')
        .then(resp => resp.json())
        .then(resp => {
          this.userCode = resp.user_code
          this.deviceCode = resp.device_code
          setStorage('user_code', this.userCode)
          setStorage('device_code', this.deviceCode)
        })
        .catch(err => console.error(err));
    },
    verify() {
      fetch('https://leetcode-repo-manager.herokuapp.com/verify', {
        method: 'POST',
        body: JSON.stringify({ device_code: this.deviceCode }),
        headers: { 'Content-Type': 'application/json' }
      })
        .then(resp => resp.json())
        .then(resp => {
          this.token = resp.access_token;
          setStorage('access_token', this.token);
          this.needLogin = false;
        })
        .catch(err => console.error(err));
    },
    updateExercise() {
      chrome.tabs.query({ currentWindow: true, active: true }, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, { info: true }, (response) => {
          this.updateFile(response).then(() => {
            console.log("Submitted")
          })
        });
      })
    },
    getUserInfo,
    getMainSHA,
    updateReference,
    createCommit,
    createTree,
    updateFile
  }
}

const vm = Vue.createApp(App).mount('#app')

getStorage('repo_name')
  .then(repo => {
    vm.repo = repo;
  })

getStorage('access_token')
  .then(token => {
    if (token) {
      vm.needLogin = false;
      vm.token = token;
      vm.loaded = true;
    } else {
      getStorage('user_code')
        .then(userCode => {
          if (userCode) {
            vm.userCode = userCode;
            getStorage('device_code')
              .then(deviceCode => {
                vm.deviceCode = deviceCode;
                vm.loaded = true;
              })
          } else {
            vm.loaded = true;
          }
        })
    }
  })
  .catch(err => console.error(err))