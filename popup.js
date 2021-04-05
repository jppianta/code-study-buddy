function getUserCode() {
  return new Promise((res, rej) => {
    chrome.storage.sync.get(['user_code'], function (result) {
      if (result) {
        res(result.user_code);
      } else {
        rej();
      }
    });
  })
}

function setUserCode(user_code) {
  chrome.storage.sync.set({ user_code });
}

function getDeviceCode() {
  return new Promise((res, rej) => {
    chrome.storage.sync.get(['device_code'], function (result) {
      if (result) {
        res(result.device_code);
      } else {
        rej();
      }
    });
  })
}

function setDeviceCode(device_code) {
  chrome.storage.sync.set({ device_code });
}

function getToken() {
  return new Promise((res, rej) => {
    chrome.storage.sync.get(['access_token'], function (result) {
      if (result) {
        res(result.access_token);
      } else {
        rej();
      }
    });
  })
}

function setToken(access_token) {
  chrome.storage.sync.set({ access_token });
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
      deviceCode: '',
      userCode: '',
      token: ''
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
          setUserCode(this.userCode)
          setDeviceCode(this.deviceCode)
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
          setToken(this.token);
          this.needLogin = false;
        })
        .catch(err => console.error(err));
    },
    listRepos() {
      fetch('https://api.github.com/user/repos', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/vnd.github.v3+json', 'Authorization': `token ${this.token}` }
      })
        .then(resp => resp.json())
        .then(resp => {
          console.log(resp)
        })
        .catch(err => console.error(err));
    }
  }
}

const vm = Vue.createApp(App).mount('#app')

getToken()
  .then(token => {
    console.log(token)
    if (token) {
      vm.needLogin = false;
      vm.token = token;
      vm.loaded = true;
    } else {
      getUserCode()
        .then(userCode => {
          if (userCode) {
            vm.userCode = userCode;
            getDeviceCode()
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