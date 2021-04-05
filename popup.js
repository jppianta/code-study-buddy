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
    async getMainSHA() {
      if (!this.ownerName) {
        await this.getUserInfo();
      }
      return fetch(`https://api.github.com/repos/${this.ownerName}/${this.repo}/branches/main`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/vnd.github.v3+json', 'Authorization': `token ${this.token}` }
      })
        .then(resp => resp.json())
        .then(resp => {
          if (resp.commit) {
            return resp.commit.sha;
          }
        })
        .catch(err => console.error(err));
    },
    getUserInfo() {
      return fetch('https://api.github.com/user', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/vnd.github.v3+json', 'Authorization': `token ${this.token}` }
      })
        .then(resp => resp.json())
        .then(resp => {
          this.ownerName = resp.login
        })
        .catch(err => console.error(err));
    }
  }
}

const vm = Vue.createApp(App).mount('#app')

getStorage('access_token')
  .then(token => {
    console.log(token)
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