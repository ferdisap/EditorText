<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch, nextTick } from "vue";
import Menu from "./Menu.vue";
import ExplorerTree from "./ExplorerTree.vue";
import SearchPane from "./SearchPane.vue";
import { useResizePanel } from "@/composables/useResizePanel";
import { useWorkspace } from "@/composables/useWorkspace";
import { useHidden } from "@/composables/navigation/useHidden";

const props = defineProps<{ groupsData?: any }>();
const emits = defineEmits(["openFile"]);

const { navContent, isHidden, toggle } = useHidden();
const active = ref("explorer");
const tree = ref([
  { id: "1", name: "src", children: [{ id: "1-1", name: "main.ts" }] },
]);

const panelEl = ref<HTMLElement | null>(null);
const { startResize, stopResize } = useResizePanel(panelEl, 260);


function onSelect(id: string) {
  if(active.value === id){
    isHidden.value = !isHidden.value;
  } else {    
    if(isHidden.value) isHidden.value = false;
  }
  active.value = id;
}

const currentComponent = computed(() => {
  switch (active.value) {
    case "explorer":
      return ExplorerTree;
    case "search":
      return SearchPane;
    default:
      return ExplorerTree;
  }
});
const currentTitle = computed(() => {
  switch (active.value) {
    case "explorer":
      return "Explorer";
    case "search":
      return "Search";
    default:
      return "Explorer";
  }
});

function openNode(node: any) {
  emits("openFile", node);
}

watch(isHidden, () => {
  nextTick(() => {

  })
})

onMounted(() => {
  window.addEventListener("mouseup", stopResize);
});
onBeforeUnmount(() => {
  window.removeEventListener("mouseup", stopResize);
  stopResize();
});
</script>

<template>
  <aside class="workspace-nav">
    <div class="main-nav">
      <Menu :active="active" @select="onSelect" class="nav-menu" />

      <div ref="navContent" :class="['nav-content', { hidden: isHidden }]">
        <div
          class="panel-header flex items-center justify-between px-3 py-2 border-b"
        >
          <div class="flex items-center gap-2">
            <h4 class="text-sm font-medium">{{ currentTitle }}</h4>
          </div>
          <div class="flex items-center gap-1">
            <button @click="toggle" class="px-2 py-1 text-xs">
              {{ isHidden ? "Hide" : "Show" }}
            </button>
            <button
              @mousedown.prevent.stop="startResize"
              class="resize-handle"
              title="Drag to resize"
            >
              <i class="codicon codicon-dash"></i>
            </button>
          </div>
        </div>

        <div class="panel-body p-2 overflow-auto h-[calc(100%-40px)]">
          <component :is="currentComponent" :tree="tree" @open="openNode" />
        </div>
      </div>
    </div>
  </aside>
</template>
