<script setup lang="ts">
import { type TreeNode, type TreeRoot } from "@/types/tree.type";
import { reactive, ref } from "vue";
import Folder from "./Tree/Folder.vue";
import Files from "./Tree/Files.vue";

const props = defineProps<{
  root: TreeRoot,
}>()

const isOpenContent = ref(false);

function toggleContent(){
  isOpenContent.value = !isOpenContent.value
}
</script>
<template>
  <div class="ws-tree">
    <div class="nav-content-ident" @click.stop="toggleContent">
      <i class="codicon" :class="['codicon', isOpenContent ? 'codicon-chevron-down' : 'codicon-chevron-right']"></i>
      <span class="tab-name font-bold">{{ root.name }}</span>
    </div>
    <ul class="tree-root" v-show="isOpenContent">
      <li class="tree-node-child" v-for="node in props.root.children" :key="node.path">
        <!-- if dir -->
        <Folder v-if="node.type === 'dir'" :node="node" :uri="root.uri"/>
        <Files v-else :node="node" :uri="root.uri"/>
      </li>
    </ul>
  </div>
</template>
