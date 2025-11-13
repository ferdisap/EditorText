<script setup lang="ts">
import { EDITOR_MAIN_CONTAINER_CSS_CLASS, useEditorContainer } from "@/composables/useEditorContainer";
import { useWorkspace } from "@/composables/useWorkspace";
import { TabClass } from "@/types/editor";
import {  nextTick, watch } from "vue";

const props = defineProps<{ tab: TabClass | undefined; groupId: string }>();
const { editorMainContainer, attachToEl, detachFromEl } = useEditorContainer(
  props.groupId
);

const setActive = () => {
  const { workspace } = useWorkspace();
  workspace.setActiveGroup(props.groupId);
  // const group = workspace.activeGroup;
  // group!.setActiveTab(props.tab!.id);
  // props.tab!.instance.editor.layout();
};

// Ganti editor yang aktif sesuai tab
watch(
  () => props.tab,
  (newVal, oldVal) => {
    if(oldVal) detachFromEl(oldVal);
    if(newVal) attachToEl(newVal);
    nextTick(() => {
      setTimeout(() => newVal?.instance.editor.focus(), 10)
    });
  }
);
</script>

<template>
  <div class="editor-container">
    <!-- Area editor -->
    <div ref="editorMainContainer" :class="EDITOR_MAIN_CONTAINER_CSS_CLASS" @click="setActive" />    
  </div>
</template>
