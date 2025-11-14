<script setup lang="ts">
import { goto, registerMarker, useMarker } from "@/composables/useMarker";
import { useModelStore } from "@/composables/useModelstore";
import { useWorkspace } from "@/composables/useWorkspace";
import { MARKER_VALIDATION_NS } from "@/core/Marker";
import { computed, nextTick, onBeforeUnmount, ref } from "vue";


registerMarker({
  "namespace": MARKER_VALIDATION_NS,
  "container": null
});
const { markerContainer, markerInfoMap, clear } = useMarker(MARKER_VALIDATION_NS);

const { workspace } = useWorkspace();

const getModelUri = (modelId: string) => {
  return workspace.models.find((model) => model.id === modelId)?.uri;
};
const getModelName = (modelId: string) => {
  return workspace.models.find((model) => model.id === modelId)
    ?.name;
};

let show = ref(true);
const toggleMarker = () => {
  show.value = !show.value;
  const { workspace } = useWorkspace();
  for(const group of workspace.groups){
    nextTick(()=> group.activeTab?.instance.layout());
  }
  console.log('showMarkerContainer', show.value)
}

onBeforeUnmount(() => {
  clear();
})

</script>
<template>
  <!-- Panel error -->
  <div class="marker-wrapper">
    <div class="marker-tabs">
      <div class="tab-item active" @click.stop="toggleMarker">
        <span class="tab-name">Problems</span>
      </div>
    </div>
    <div class="marker-container" v-if="show">
      <div ref="markerContainer" class="marker-validate-panel-container">
        <!-- untuk per model -->
        <div
          v-for="[key, modelValidationInfos] of markerInfoMap.entries()"
          :id="key"
          class="marker"
        >
        <div v-if="modelValidationInfos.length > 0">
          <div class="model-ident">
            <span class="tab-name">{{ getModelName(key) }}</span>
            &nbsp;
            <span class="model-uri">{{ getModelUri(key) }}</span>
          </div>
          <div v-for="info in modelValidationInfos" class="info" @click.stop="goto(key, info.detail.line, info.detail.col)">
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
  </div>
</template>
