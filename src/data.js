/* eslint-disable no-undef */
import { reactive } from 'vue';

export function getStorageValue(var_name, type = 'local') {
  return new Promise((res, rej) => {
    chrome.storage[type].get([var_name], function (result) {
      if (result) {
        res(result[var_name]);
      } else {
        rej();
      }
    });
  })
}

export function setStorageValue(var_name, value, type = 'local') {
  const pair = {};
  pair[var_name] = value;
  chrome.storage[type].set(pair);
}

export function clearStorageValue() {
  chrome.storage.sync.clear();
  chrome.storage.local.clear();
}

export function clearCodes() {
  data.setDeviceCode('');
  data.setUserCode('');
  setStorageValue('user_code', '');
  setStorageValue('device_code', '');
}

export async function loadingTask(promise) {
  data.setLoading(true);
  data.clearInfo();
  await promise
    .then(() => data.setLoading(false))
    .catch(err => {
      data.setLoading(false)
      console.error(err)
    })
}

export async function initializeVariables() {
  const token = await getStorageValue('access_token', 'sync');
  if (token) {
    data.setToken(token);
    clearCodes();
    return;
  }
  const userCode = await getStorageValue('user_code');
  data.setUserCode(userCode)
  const deviceCode = await getStorageValue('device_code');
  data.setDeviceCode(deviceCode);
}

export function getDetails() {
  return new Promise((res, rej) => {
    chrome.tabs.query({ currentWindow: true, active: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, { info: true }, (response) => {
        if (chrome.runtime.lastError) {
          rej(chrome.runtime.lastError)
        } else {
          res(response)
        }
      });
    })
  });
}

export const data = {
  state: reactive({
    token: '',
    userCode: '',
    deviceCode: '',
    repo: '',
    branches: [],
    info: null,
    loading: true
  }),

  logout() {
    this.clearInfo();
    this.setToken('')
    this.setUserCode('')
    this.setDeviceCode('')
    this.setRepo('')
    clearStorageValue()
  },

  setRepo(value) {
    this.state.repo = value;
  },

  setToken(value) {
    this.state.token = value;
  },

  setUserCode(value) {
    this.state.userCode = value;
  },

  setDeviceCode(value) {
    this.state.deviceCode = value;
  },

  setInfo(value) {
    this.state.info = value;
  },

  clearInfo() {
    this.state.info = null;
  },

  setLoading(value) {
    this.state.loading = value;
  },

  setBranches(value) {
    this.state.branches = value;
  }
}