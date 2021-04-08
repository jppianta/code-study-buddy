<template>
  <div class="title flex">
    <img src="../assets/logo.png" />
    <h1>Code Study Buddy</h1>
  </div>
</template>

<script>
export default {
  name: "Title",
};
</script>

<style>
.title {
  height: 45px;
  justify-content: space-between;
  align-items: center;
}

.title > h1 {
  margin: 0;
  font-weight: 500;
  font-size: 18px;
}

.title > img {
  height: 100%;
}
</style>