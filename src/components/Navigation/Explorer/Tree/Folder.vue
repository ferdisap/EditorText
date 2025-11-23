<script setup lang="ts">
import type { TreeNode } from "@/types/tree.type";
import Files from "./Files.vue";

const props = defineProps<{
  node: TreeNode;
  uri: string,
}>();

function toggle(node: TreeNode) {
  node.expanded = !node.expanded;
}
function openDir(node: TreeNode) {
  
}
</script>
<template>
  <div class="node-dir ws-list-hovered-bg-main" @click="toggle(node)">
    <i
      class="codicon"
      :class="node.children ? 'codicon-chevron-right' : 'codicon-chevron-down'"
    ></i>
    <span @dblclick.stop="openDir(node)">{{ node.name }}</span>
  </div>
  <ul v-if="node.expanded" class="ml-4">
    <li
      v-for="child in node.children"
      :key="child.path"
      class="tree-node-child"
    >
      <Files :node="child" :uri="uri"/>
    </li>
  </ul>
</template>
