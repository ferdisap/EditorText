<script setup lang="ts">
import { useMarker } from "@/composables/useMarker";
import { useWorkspace } from "@/composables/useWorkspace";

const { markerContainer, markerInfoMap } = useMarker();

const { workspace } = useWorkspace();

const getModelUri = (modelId: string) => {
  return workspace.models.find((model) => model.id === modelId)?.uri;
};
const getModelName = (modelId: string) => {
  return workspace.models.find((model) => model.id === modelId)
    ?.name;
};
</script>
<template>
  <!-- Panel error -->
  <div class="marker-wrapper">
    <div class="marker-tabs">
      <div class="tab-item active">
        <span class="tab-name">Problems</span>
      </div>
      <div class="tab-item">
        <span class="tab-name">Fufufafa</span>
      </div>
    </div>
    <div class="marker-container">
      <div ref="markerContainer" class="marker-panel-container">
        <!-- untuk per model -->
        <div
          v-for="[key, modelValidationInfos] of markerInfoMap.entries()"
          :id="key"
          class="marker"
        >
          <div class="model-ident">
            <span class="tab-name">{{ getModelName(key) }}</span>
            &nbsp;
            <span class="model-uri">{{ getModelUri(key) }}</span>
          </div>
          <div v-for="info in modelValidationInfos" class="info">
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
  </div>
</template>
