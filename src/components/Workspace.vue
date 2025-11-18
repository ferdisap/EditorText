<script setup lang="ts">
import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
} from "vue";
import { useWorkspace } from "@/composables/useWorkspace";
import Group from "./Group.vue";
import { registerCompletionItemProvider } from "@/languages/xml/init";
import { useTheme } from "@/composables/useTheme";
import { terminateWorker } from "@/composables/useWorker";
import Marker from "./Marker.vue";
import { GroupClass } from "@/types/editor";
import Prompt from "./Prompt.vue";
import { usePrompt } from "@/composables/usePrompt";
import Sidebar from "./Navigation/Sidebar.vue";
import { observeSize } from "@/util/htmlElement";
import { useHidden, width } from "@/composables/navigation/useHidden";

const { workspace, relayout } = useWorkspace();
registerCompletionItemProvider(workspace);

const { applyTheme } = useTheme();
applyTheme();

// const groups = computed(() => workspace.groups);
const groups = computed(() => workspace.groups);

const editorGroupWrapper = ref<HTMLElement | null>(null);

const { isHidden } = useHidden();

onBeforeUnmount(() => {
  terminateWorker(null);
});

watch(isHidden, (oldVal, newVal) => {
  const currentWidth = editorGroupWrapper.value?.clientWidth; // 1112
  console.log(currentWidth);
  nextTick(() => {
    const { navContent } = useHidden();
    if (newVal) {
      const navContentWidth = navContent.value!.clientWidth; // 253
      const finalWidth = currentWidth! - navContentWidth;
      editorGroupWrapper.value!.style.width = finalWidth + "px";
      console.log(currentWidth, editorGroupWrapper.value?.clientWidth)
      relayout({size: finalWidth, unit: 'px'});
    } else {
      editorGroupWrapper.value!.style.width = "100%";
      relayout();
    }
  });
});

top.relayout = relayout

onMounted(() => {
  // Buat 1 group kalau belum ada
  if (workspace.groups.length === 0) {
    const group1 = workspace.addGroup("Main Group");
    const group2 = workspace.addGroup("Second Group");
    workspace.setActiveGroup(group1.id);
    
    setTimeout(() => {
      // const uri = "http://localhost:5173/test/purchaseOrder.xml";
      // fetch(uri).then(r => r.text()).then(text =>
      // group1.newFile(text, 'xml', uri)
      // )
      // group1.newFile('', '', '')
      // workspace.activeGroup!.newFile('', '', '')
      // group1.newFile('', 'xml', 'http://localhost:5173/test/purchaseOrder.xml')
      // group1.newFile('', 'xml', 'http://localhost:5173/test/purchaseOrder.xml')
      group1.newFile(
        "",
        "xml",
        "http://localhost:5173/test/DMC-BRAKE-AAA-DA1-00-00-00AA-041A-A_003-00_EN-US.XML"
      );
      // group1.newFile('', '', '')
      group2.newFile(
        "",
        "",
        "http://localhost:5173/test/purchaseOrder_mod.xml"
      );
      // group1.compareFile(
      //   "http://localhost:5173/test/purchaseOrder.xml",
      //   "http://localhost:5173/test/purchaseOrder_mod.xml"
      // );
      nextTick(() => relayout())
    },1000);
  }
});

// top.addg = () => workspace.value.addGroup("Second Group");
// top.addg = () => workspace.addGroup("Second Group");
// top.ws = workspace

const { isOpenPrompt } = usePrompt();
</script>

<template>
  <div class="workspace">
    <!-- LEFT NAVIGATION -->
    <Sidebar />

    <!-- EDITOR AREA -->
    <div class="workspace-editor">
      <div ref="editorGroupWrapper" class="editor-group-wrapper">
        <Group v-for="group in groups" :key="group.id" :group="group" />
      </div>
      <Marker />
    </div>

    <Prompt v-if="isOpenPrompt" />
  </div>
</template>
