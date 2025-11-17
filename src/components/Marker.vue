<script setup lang="ts">
import { useWorkspace } from "@/composables/useWorkspace";
import { nextTick, ref } from "vue";
import TabProblem from "./Marker/TabProblem.vue";
import Problem from "./Marker/Problem.vue";
import { MARKER_VALIDATION_NS } from "@/core/panel/Problem";
import TabDetail from "./Marker/TabDetail.vue";
import Detail from "./Marker/Detail.vue";
import { MARKER_DETAIL_NS } from "@/core/panel/Detail";

// let activeMarkerNamespace = ref(MARKER_VALIDATION_NS);
let activeMarkerNamespace = ref(MARKER_DETAIL_NS);

let show = ref(true);
const toggleMarker = () => {
  show.value = !show.value;
  const { workspace } = useWorkspace();
  for(const group of workspace.groups){
    nextTick(()=> group.activeTab?.instance.layout());
  }
}

const setActive = (namespace:string) => {
  if(activeMarkerNamespace.value !== namespace) activeMarkerNamespace.value = namespace
  else {
    toggleMarker();
  }
}

</script>
<template>
  <!-- Panel error -->
  <div class="marker-wrapper">
    <div class="marker-tabs">
      <TabProblem @active="setActive"/>
      <TabDetail @active="setActive"/>
    </div>
    <div class="marker-container" v-show="show">
      <Problem :active="activeMarkerNamespace"/>
      <Detail :active="activeMarkerNamespace"/>
    </div>
  </div>
</template>
