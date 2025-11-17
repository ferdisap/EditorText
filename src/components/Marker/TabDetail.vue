<script setup lang="ts">
import { MARKER_DETAIL_NS } from '@/core/panel/Detail';

const emit = defineEmits(["active"])

const activate = () => {
  emit("active", MARKER_DETAIL_NS);
}
</script>

<template>
  <div class="tab-item" @click="activate">
    <span class="tab-name">Detail</span>
  </div>
</template>
