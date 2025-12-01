<script setup lang="ts">
import { MARKER_DETAIL_NS } from '@js-editor/core/panel/Detail';

defineProps<{activeNs: string}>()

const emit = defineEmits(["active"])

const activate = () => {
  emit("active", MARKER_DETAIL_NS);
}
</script>

<template>
  <div :class="['tab-item', { active: activeNs === MARKER_DETAIL_NS}]" @click="activate">
    <span class="tab-name">Detail</span>
  </div>
</template>
