<script setup lang="ts">
import type { TreeNode } from "@/types/tree.type";

const props = defineProps<{
  node: TreeNode;
  uri: string,
}>();

function openFile(node:TreeNode) {

}
</script>
<template>
  <div class="node-files ws-list-hovered-bg-main">
    <i class="codicon codicon-file" />
    <a href="#" @click.stop.prevent  @dblclick.stop="openFile(node)">{{ node.name }}</a>
  </div>
</template>
