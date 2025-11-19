<script setup lang="ts">
import { TreeNode } from "@/types/tree";
import { reactive, ref } from "vue";

const tree = ref<TreeNode[]>([
  { id: "1", name: "src", children: [{ id: "1-1", name: "main.ts" }] },
]);

const emits = defineEmits(["open"]);

const isOpenContent = ref(false);

function toggle(node: any) {
  node.expanded = !node.expanded;
}
function open(node: any) {
  emits("open", node);
}

function toggleContent(){
  isOpenContent.value = !isOpenContent.value
}
</script>
<template>
  <div class="ws-tree">
    <div class="nav-content-ident" @click.stop="toggleContent">
      <i class="codicon" :class="['codicon', isOpenContent ? 'codicon-chevron-down' : 'codicon-chevron-right']"></i>
      <span class="tab-name font-bold">WORKSPACE 1</span>
    </div>
    <ul class="tree-root" v-show="isOpenContent">
      <li v-for="node in tree" :key="node.id">
        <div class="tree-node" @click="toggle(node)">
          <i
            class="codicon"
            :class="node.children ? 'codicon-chevron-right' : 'codicon-chevron-down'"
          ></i>
          <span @dblclick.stop="open(node)">{{ node.name }}</span>
        </div>
        <ul v-if="node.expanded" class="ml-4">
          <li
            v-for="child in node.children"
            :key="child.id"
            class="tree-node-child"
          >
            <i class="codicon codicon-file"/>
            <span @dblclick.stop="open(child)">{{ child.name }}</span>
          </li>
        </ul>
      </li>
    </ul>
  </div>
</template>
