<script setup lang="ts">
import { useMarkerPanel } from "@/composables/useMarkerPanel";
import { useModelStore } from "@/composables/useModelstore";
import { useWorkspace } from "@/composables/useWorkspace";
import {
  IMarkerProblem,
  MARKER_VALIDATION_NS,
  MarkerProblem,
  ProblemResult,
} from "@/core/panel/Problem";
import { registerMarkerPanel } from "@/plugins/marker.plugin";
import { computed } from "vue";

defineProps<{active:string}>();

registerMarkerPanel(new MarkerProblem(MARKER_VALIDATION_NS));

const { panel } = useMarkerPanel<ProblemResult,IMarkerProblem>();

const { workspace } = useWorkspace();
const panelvalidation = computed(() => panel(MARKER_VALIDATION_NS));
const models = computed(() => workspace.models);

const { modelStore } = useModelStore();
function getValidationResult(modelId: string) {
  return panelvalidation.value.map.get(modelStore.getModel(modelId)!);
}

const getModelUri = (modelId: string) => {
  return workspace.models.find((model) => model.id === modelId)?.uri;
};
const getModelName = (modelId: string) => {
  return workspace.models.find((model) => model.id === modelId)?.name;
};

</script>
<template>
  <div class="marker-panel-wrapper" v-show="active === MARKER_VALIDATION_NS">
    <!-- untuk per model -->
    <div v-for="model of models" class="marker">
      <div v-if="getValidationResult(model.id)?.data.length">
        <div class="model-ident">
          <span class="tab-name">{{ getModelName(model.id) }}</span>
          &nbsp;
          <span class="model-uri">{{ getModelUri(model.id) }}</span>
        </div>
        <div
          v-for="info in getValidationResult(model.id)?.data"
          class="info"
          @click.stop="
            panelvalidation.goto(model.id, info.detail.line, info.detail.col)
          "
        >
          <span class="message">{{ info.detail.message }}</span>
          <span class="loc"
            >[Ln&nbsp;<span class="line">{{ info.detail.line }}</span
            >,&nbsp;Col&nbsp;<span class="col">{{ info.detail.col }}</span
            >]</span
          >
        </div>
      </div>
    </div>
  </div>
</template>
