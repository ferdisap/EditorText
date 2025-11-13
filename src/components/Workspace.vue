<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { useWorkspace } from "@/composables/useWorkspace";
import Group from "./Group.vue";
import { registerCompletionItemProvider } from "@/languages/xml/init";
import { useTheme } from "@/composables/useTheme";
import { terminateWorker } from "@/composables/useWorker";
import Marker from "./Marker.vue";
import { GroupClass } from "@/types/editor";

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
      unit: '%',
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
      group1.newFile();
    })
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
</template>
