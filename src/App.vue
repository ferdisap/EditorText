<script setup lang="ts">
import Workspace from "@/components/Workspace.vue";
import Editor from "@/components/Editor.vue";
import { Group } from "./core/Group";
import { useEditorContainer } from "./composables/useEditorContainer";
import * as monaco from "monaco-editor";
import { onMounted, ref, Ref } from "vue";

// const group = Group('group 1');
// const { editorMainContainer, attachToEl, detachFromEl } = useEditorContainer(
//   group.id
// );
// setTimeout(() => {
//   group.newFile();
//   console.log('new file');
//   top.gr = group
//   // top.editor = group.activeTab.instance.editor
// },1000)

// top.gr = group;

// const contaeditorMainContaineriner:Ref<HTMLElement|null> = ref(null)

// onMounted(() => {
  // const ed = monaco.editor.create(editorMainContainer.value!)
  // top.editor = ed
// })

</script>

<template>
  <Workspace />
   <!-- <Editor :group-id="group.id"/> -->
   <!-- <div ref="editorMainContainer" class="h-full w-full"/>     -->
</template>
