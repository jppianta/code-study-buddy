<template>
  <div :class="['info', 'flex', shared.info.type]">
    <p>{{ shared.info.message }}</p>
  </div>
</template>

<script>
import { data } from '../data'
export default {
  name: 'Info',
  data() {
    return {
      shared: data.state
    }
  }
}
</script>

<style>
.info {
  padding: 8px;
  margin-top: 12px;
  align-items: center;
}

.info.error {
  background: #fde7e9;
  color: #d13438;
}

.info.success {
  background: #e1f5e1;
  color: #0b6a0b;
}
</style>