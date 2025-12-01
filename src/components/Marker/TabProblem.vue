<script setup lang="ts">
import { useMarkerPanel } from '@js-editor/composables/useMarkerPanel';
import { useModelStore } from '@js-editor/composables/useModelstore';
import { useWorkspace } from '@js-editor/composables/useWorkspace';
import { type IMarkerProblem, MARKER_VALIDATION_NS, type ProblemResult } from '@js-editor/core/panel/Problem';
import { computed } from 'vue';

defineProps<{activeNs: string}>()

const emit = defineEmits(["active"])

const activate = () => {
  emit("active", MARKER_VALIDATION_NS);
}

const { modelStore } = useModelStore();
function getValidationResultLength(modelId: string) {
  const results = panelvalidation.value.map.get(modelStore.getModel(modelId)!);
  return results ? results!.data.length : 0;
}

const { panel } = useMarkerPanel<ProblemResult, IMarkerProblem>();
const panelvalidation = computed(() => panel(MARKER_VALIDATION_NS));
const { workspace } = useWorkspace();
const totalProblem = computed(() => {
  let qty:number = 0;
  for(const modelData of workspace.models){
    qty += getValidationResultLength(modelData.id);
  }
  return qty;
})
</script>

<template>
  <div :class="['tab-item', { active: activeNs === MARKER_VALIDATION_NS}]" @click="activate">
    <span class="tab-name">Problems <span v-if="totalProblem > 0" class="rounded-full bg-blue-500 px-[5px] py-[2px] text-white">{{ totalProblem }}</span></span>
  </div>
</template>
