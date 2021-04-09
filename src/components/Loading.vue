<template>
  <div class="flex flex-center loading">
    <img src="../assets/spinning.svg" />
    <p>{{ message }}</p>
  </div>
</template>

<script>
export default {
  name: "Loading",
  props: ["message"],
};
</script>

<style>
.loading {
  position: absolute;
  width: 100%;
  height: calc(100% - 60px);
  left: 0;
  top: 60px;
}
</style>