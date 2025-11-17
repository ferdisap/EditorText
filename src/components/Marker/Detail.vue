<script setup lang="ts">
import { useMarkerPanel } from "@/composables/useMarkerPanel";
import { useModelStore } from "@/composables/useModelstore";
import { useWorkspace } from "@/composables/useWorkspace";
import {
  DetailResult,
  MARKER_DETAIL_NS,
  MarkerDetail,
} from "@/core/panel/Detail";
import { registerMarkerPanel } from "@/plugins/marker.plugin";
import { onBeforeDisposeModel } from "@/plugins/model.plugin";
import { MonacoModel } from "@/types/editor";
import { ModelIndex } from "@/types/workspace";
import { computed, reactive, watch } from "vue";

defineProps<{ active: string }>();
registerMarkerPanel(new MarkerDetail(MARKER_DETAIL_NS));

const { panel } = useMarkerPanel<DetailResult, MarkerDetail>();

const { workspace } = useWorkspace();
const panelDetail = computed(() => panel(MARKER_DETAIL_NS));

const { modelStore } = useModelStore();
function getDetailResult(modelId: string) {
  return panelDetail.value.map.get(modelStore.getModel(modelId)!)?.data;
}
function getModelUri(modelId: string) {
  return workspace.models.find((model) => model.id === modelId)?.uri;
}
function getModelName(modelId: string) {
  return workspace.models.find((model) => model.id === modelId)?.name;
}

// const mapShowHideResult = reactive(new WeakMap<ModelIndex, boolean>());
/** key:string is modelId */
const mapShowHideResult = reactive(new Map<string, boolean>());
const models = computed(() => {
  const models = workspace.models;
  for (const model of models) {
    if (!mapShowHideResult.has(model.id)) {
      mapShowHideResult.set(model.id, false);
    }
    const modelEditor = modelStore.getModel(model.id);
    onBeforeDisposeModel(modelEditor!, () => {
      console.log('fufuafa')
      mapShowHideResult.delete(model.id)
    })
  }
  return models;
});
function toggleResult(modelId: string) {
  let oldState: boolean;
  if (mapShowHideResult.has(modelId)) {
    oldState = Boolean(mapShowHideResult.get(modelId));
  } else {
    oldState = false;
    mapShowHideResult.set(modelId, oldState);
  }
  mapShowHideResult.set(modelId, !oldState);
}
</script>

<template>
  <div class="marker-panel-wrapper" v-show="active === MARKER_DETAIL_NS">
    <!-- untuk per model -->
    <div v-for="model in models" class="marker">
      <div v-if="getDetailResult(model.id)">
        <div class="model-ident" @click.stop="toggleResult(model.id)">
          <span class="tab-name">{{ getModelName(model.id) }}</span>
          &nbsp;
          <span class="model-uri">{{ getModelUri(model.id) }}</span>
        </div>
        <div class="info" v-show="mapShowHideResult.get(model.id)">
          <table>
            <tbody>
              <tr v-for="[key, value] in Object.entries(model)">
                <td>{{ key }}</td>
                <td>:{{ value || "-" }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>
