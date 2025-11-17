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
import { computed } from "vue";

defineProps<{ active: string }>();
registerMarkerPanel(new MarkerDetail(MARKER_DETAIL_NS));

const { panel } = useMarkerPanel<DetailResult, MarkerDetail>();

const { workspace } = useWorkspace();
const models = computed(() => workspace.models);
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
</script>

<template>
  <div class="marker-panel-wrapper" v-show="active === MARKER_DETAIL_NS">
    <!-- untuk per model -->
    <div v-for="model in models" class="marker">
      <div v-if="getDetailResult(model.id)">
        <div class="model-ident">
          <span class="tab-name">{{ getModelName(model.id) }}</span>
          &nbsp;
          <span class="model-uri">{{ getModelUri(model.id) }}</span>
        </div>
        <div class="info">
          <table>
            <tbody>
              <tr>
                <td>URI</td>
                <td>:{{ getDetailResult(model.id)?.uri }}</td>
              </tr>
              <tr>
                <td>Language</td>
                <td>:{{ getDetailResult(model.id)?.language }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <!-- <div v-for="info in getDetailResult(model.id)?.data" class="info">
          {{ info }}
            uri: {{ info }}
        </div> -->
      </div>
    </div>
  </div>
</template>
