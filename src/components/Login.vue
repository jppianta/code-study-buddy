<template class="login">
  <div>
    <div class="user-code flex-column mb-12">
      <h2>Authentication Code</h2>
      <div class="code flex flex-center">
        <p>{{ shared.userCode }}</p>
        <button @click="getCode" class="flex flex-center">
          <img src="../assets/refresh.svg" />
        </button>
      </div>
      <p class="inst">
        Please enter the follwing code at
        <a target="_blank" href="https://github.com/login/device"
          >https://github.com/login/device</a
        >
      </p>
    </div>
  </div>
</template>

<script>
import { data, setStorageValue, loadingTask } from "../data.js";

export default {
  name: "Login",
  data() {
    return {
      shared: data.state,
    };
  },
  methods: {
    getCode() {
      loadingTask(
        fetch("https://leetcode-repo-manager.herokuapp.com/code")
          .then((resp) => resp.json())
          .then((resp) => {
            const userCode = resp.user_code;
            const deviceCode = resp.device_code;
            data.setUserCode(userCode);
            data.setDeviceCode(deviceCode);
            setStorageValue("user_code", userCode);
            setStorageValue("device_code", deviceCode);
          })
          .catch(() => {
            data.setInfo({
              message:
                "Failed to get a code. Should be a network issue. Please, try again later.",
              type: "error",
            });
          })
      );
    },
    verify() {
      loadingTask(
        fetch("https://leetcode-repo-manager.herokuapp.com/verify", {
          method: "POST",
          body: JSON.stringify({ device_code: this.shared.deviceCode }),
          headers: { "Content-Type": "application/json" },
        })
          .then((resp) => resp.json())
          .then((resp) => {
            const token = resp.access_token;
            data.setToken(token);
            setStorageValue("access_token", token, "sync");
          })
      );
    },
  },
  mounted() {
    if (!this.shared.userCode) {
      this.getCode();
    } else {
      this.verify();
    }
  },
};
</script>
<style>
.user-code > h2 {
  font-weight: 600;
  margin-bottom: 8px;
  font-size: 18px;
}

.code {
  margin-bottom: 6px;
}

.code > p {
  font-size: 18px;
  flex: 1;
}

.code > button > img {
  height: 18px;
}

.code > button {
  height: 25px;
  width: 25px;
  border-radius: 50%;
}

.user-code > .inst {
  font-size: 13px;
}
</style>
