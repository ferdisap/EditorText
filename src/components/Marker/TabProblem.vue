<script setup lang="ts">
import { MARKER_VALIDATION_NS } from '@/core/panel/Problem';

// const props = defineProps<{ tab?: TabClass | undefined; groupId: string }>();

const emit = defineEmits(["active"])

const activate = () => {
  emit("active", MARKER_VALIDATION_NS);
}
</script>

<template>
  <div class="tab-item" @click="activate">
    <span class="tab-name">Problems</span>
  </div>
</template>
