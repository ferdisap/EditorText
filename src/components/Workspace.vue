<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { useWorkspace } from "@/composables/useWorkspace";
import Group from "./Group.vue";
import { registerCompletionItemProvider } from "@/languages/xml/init";
import { useTheme } from "@/composables/useTheme";
import { terminateWorker } from "@/composables/useWorker";
import Marker from "./Marker.vue";
import { GroupClass } from "@/types/editor";
import CommandPalette from "./CommandPalette.vue";

const { workspace } = useWorkspace();
registerCompletionItemProvider(workspace);

const { applyTheme } = useTheme();
applyTheme();

// const groups = computed(() => workspace.groups);

const groupsData = computed(() => {
  const totalGroup = workspace.groups.length;
  return workspace.groups.map((group) => ({
    // class: "editor-group",
    group,
    dimension: {
      unit: "%",
      width: 100 / totalGroup,
      // height: 100
    },
  }));
});

onBeforeUnmount(() => {
  terminateWorker(null);
});

onMounted(() => {
  // Buat 1 group kalau belum ada
  if (workspace.groups.length === 0) {
    const group1 = workspace.addGroup("Main Group");
    // const group2 = workspace.addGroup("Second Group");
    workspace.setActiveGroup(group1.id);

    setTimeout(() => {
      // const uri = "http://localhost:5173/test/purchaseOrder.xml";
      // fetch(uri).then(r => r.text()).then(text =>
      // group1.newFile(text, 'xml', uri)
      // )
      // group1.newFile('', '', '')
      // workspace.activeGroup!.newFile('', '', '')
      // group1.newFile('', 'xml', 'http://localhost:5173/test/purchaseOrder.xml')
      group1.newFile('', 'xml', 'http://localhost:5173/test/DMC-BRAKE-AAA-DA1-00-00-00AA-041A-A_003-00_EN-US.XML')
      group1.newFile('', 'xml', 'http://localhost:5173/test/purchaseOrder.xml')
      // group1.newFile('', '', '')
      // group1.newFile('', '', 'http://localhost:5173/test/purchaseOrder_mod.xml')
      // group1.compareFile("http://localhost:5173/test/purchaseOrder.xml", "http://localhost:5173/test/purchaseOrder_mod.xml");
    });
  }
});

// top.addg = () => workspace.value.addGroup("Second Group");
// top.addg = () => workspace.addGroup("Second Group");
// top.ws = workspace
</script>

<template>
  <div class="editor-workspace">
    <div class="editor-group-wrapper">
      <Group
        v-for="data in groupsData"
        :key="data.group.id"
        :group="data.group as GroupClass"
        :width="data.dimension.width + data.dimension.unit"
      />
    </div>
    <Marker />
  </div>
  <!-- <CommandPalette/> -->
</template>
