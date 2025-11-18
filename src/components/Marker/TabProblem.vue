<script setup lang="ts">
import { MARKER_VALIDATION_NS } from '@/core/panel/Problem';

defineProps<{activeNs: string}>()

const emit = defineEmits(["active"])

const activate = () => {
  emit("active", MARKER_VALIDATION_NS);
}
</script>

<template>
  <div :class="['tab-item', { active: activeNs === MARKER_VALIDATION_NS}]" @click="activate">
    <span class="tab-name">Problems</span>
  </div>
</template>
