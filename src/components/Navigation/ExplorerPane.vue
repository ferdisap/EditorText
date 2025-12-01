<script setup lang="ts">
import GroupWorkspace from "./Explorer/GroupWorkspace.vue";
import FolderWorkspace from "./Explorer/FolderWorkspace.vue";
import { useTreeFolder } from "@js-editor/composables/navigation/useTreeFolder";
import { registerOnFetchTree } from "@js-editor/plugins/tree.plugin";
import { type TreeNode } from "@js-editor/types/tree.type";

const { treeRoot, createRoot } = useTreeFolder();

registerOnFetchTree("DUMMY WS", (node: TreeNode): string => {
  return `inmemory://fufufafa.com?path=${node.path}`;
});

createRoot("DUMMY WS", "inmemory://fufufafa.com");

</script>
<template>
  <div class="explorer-pane">
    <GroupWorkspace />
    <div
      class="mt-1 mb-1 border-b border-2 border-[var(--vscode-panel-border)]"
    ></div>
    <FolderWorkspace v-for="root in treeRoot" :key="root.uri" :root="root" />
  </div>
</template>
