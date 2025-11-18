<script setup lang="ts">
import { reactive } from "vue";
const props = defineProps<{ tree: any[] }>();
const emits = defineEmits(["open"]);

const local = reactive({ nodes: props.tree });

function toggle(node: any) {
  node.expanded = !node.expanded;
}
function open(node: any) {
  emits("open", node);
}
</script>
<template>
  <div class="explorer-tree">
    <ul class="tree-root">
      <li v-for="node in tree" :key="node.id">
        <div class="tree-node" @click="toggle(node)">
          <i
            class="codicon"
            :class="node.children ? 'codicon-chevron-right' : ''"
          ></i>
          <span @dblclick.stop="open(node)">{{ node.name }}</span>
        </div>
        <ul v-if="node.expanded" class="ml-4">
          <li
            v-for="child in node.children"
            :key="child.id"
            class="tree-node-child"
          >
            <span @dblclick.stop="open(child)">{{ child.name }}</span>
          </li>
        </ul>
      </li>
    </ul>
  </div>
</template>
