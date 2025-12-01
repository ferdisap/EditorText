<script setup lang="ts">
import { EDITOR_MAIN_CONTAINER_CSS_CLASS, useEditorContainer } from "@js-editor/composables/useEditorContainer";
import { useWorkspace } from "@js-editor/composables/useWorkspace";
import { type TabClass } from "@js-editor/types/editor.type";
import {  nextTick, watch } from "vue";

const props = defineProps<{ tab?: TabClass | undefined; groupId: string }>();
const { editorMainContainer, attachToEl, detachFromEl } = useEditorContainer(
  props.groupId
);

const setActive = () => {
  const { workspace } = useWorkspace();
  workspace.setActiveGroup(props.groupId);
};

// Ganti editor yang aktif sesuai tab
watch(
  () => props.tab,
  (newVal, oldVal) => {
    if(oldVal) detachFromEl(oldVal);
    if(newVal) attachToEl(newVal);
    nextTick(() => {
      newVal?.instance.editor.focus()
    });
  }
);
</script>

<template>
  <div class="editor-wrapper">
    <!-- Area editor -->
    <div ref="editorMainContainer" :class="EDITOR_MAIN_CONTAINER_CSS_CLASS" @click="setActive" />    
  </div>
</template>
