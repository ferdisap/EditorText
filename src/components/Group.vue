<script setup lang="ts">
import { computed } from "vue";
import Tab from "./Tab.vue";
import Editor from "./Editor.vue";
import { type GroupClass } from "@js-editor/types/editor.type";
import { useWorkspace } from "@js-editor/composables/useWorkspace";
import Path from "./Path.vue";

const props = defineProps<{ 
  group: GroupClass
 }>();
const activeTab = computed(() => props.group.activeTab);

const style = computed(() => {
  const width = props.group.dimension.width.size + props.group.dimension.width.unit;
  return `width: ${width}`;
})

const container = props.group.container;

</script>

<template>
  <div ref="container" class="editor-group" :style="style">
    <Tab :group="group" />
    <Path :group="group"/>
    <div class="editor-area">
      <Editor :tab="activeTab" :groupId="group.id"/>
    </div>
  </div>
</template>
