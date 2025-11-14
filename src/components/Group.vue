<script setup lang="ts">
import { computed } from "vue";
import Tab from "./Tab.vue";
import Editor from "./Editor.vue";
import { GroupClass } from "@/types/editor";
import { useWorkspace } from "@/composables/useWorkspace";
import Path from "./Path.vue";

const props = defineProps<{ 
  group: GroupClass,
  width: string,
 }>();
const activeTab = computed(() => props.group.activeTab);

const style = computed(() => `width: ${props.width}`)

</script>

<template>
  <div class="editor-group" :style="style">
    <Tab :group="group" />
    <Path :group="group"/>
    <div class="editor-area">
      <Editor :tab="activeTab" :groupId="group.id"/>
    </div>
  </div>
</template>
