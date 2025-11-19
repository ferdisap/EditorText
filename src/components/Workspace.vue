<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from "vue";
import { useWorkspace } from "@/composables/useWorkspace";
import Group from "./Group.vue";
import { registerCompletionItemProvider } from "@/languages/xml/init";
import { useTheme } from "@/composables/useTheme";
import { terminateWorker } from "@/composables/useWorker";
import Marker from "./Marker.vue";
import Prompt from "./Prompt.vue";
import { usePrompt } from "@/composables/usePrompt";
import Sidebar from "./Navigation/Sidebar.vue";
import { useHidden } from "@/composables/navigation/useHidden";
import {
  onNavContentResized,
  onNavContentToggled,
} from "@/plugins/sidebar.plugin";
import { WSpaceDataProp } from "@/core/Workspace";
import { GroupClass } from "@/types/editor";
import { unregisterAction } from "@/plugins/action.plugin";


const props = defineProps<{
  data: WSpaceDataProp;
}>();

const { workspace, relayout } = useWorkspace();
registerCompletionItemProvider(workspace);

const { applyTheme } = useTheme();
applyTheme();

const groups = computed(() => workspace.groups);

const editorGroupWrapper = ref<HTMLElement | null>(null);

const { isHidden } = useHidden();

onBeforeUnmount(() => {
  terminateWorker(null);
});

const { navContent } = useHidden();

const onNavToggled = () => {
  const currentWidth = editorGroupWrapper.value?.clientWidth; // 1112
  nextTick(() => {
    // jika nav content hidden maka set 100%
    if (isHidden.value) {
      editorGroupWrapper.value!.style.width = "100%";
      relayout();
    } else {
      const navContentWidth = navContent.value!.clientWidth; // 253
      const finalWidth = currentWidth! - navContentWidth;
      editorGroupWrapper.value!.style.width = finalWidth + "px";
      console.log(currentWidth, editorGroupWrapper.value?.clientWidth);
      relayout({ size: finalWidth, unit: "px" });
    }
  });
};

const onFirstRendered = () => {
  if(navContent.value){
    const navContentWidth = navContent.value!.clientWidth; // 253
    const sideBarWidth = navContentWidth + 48;
    editorGroupWrapper.value!.style.width = `calc(100vw - ${(sideBarWidth)}px)`;
  }
};

onMounted(() => {
  onNavContentToggled(onNavToggled);

  onNavContentResized((delta: number) => {
    nextTick(() => {
      editorGroupWrapper.value!.style.width = `calc(100% - ${delta}px)`;
      relayout();
    });
  });
});


// top.relayout = relayout;
// top.onFirstRendered = onFirstRendered;

onMounted(() => {
  for(const group of props.data.groups) {
    const addedGroup = workspace.addGroup();
    nextTick(() => {
      for(const editor of group.editors){
        if(editor.type === "compare"){
          addedGroup.compareFile(editor.originalUri!, editor.uri!)
        } else {
          addedGroup.newFile("", "", editor.uri || "")
        }
      }
    })
  }
  onFirstRendered()
})


onBeforeUnmount(() => {
  unregisterAction('new.tab');
  unregisterAction('toggle.theme');
  unregisterAction('split.tab');
  unregisterAction('compare.model');
})
// onMounted(() => {
//   if (workspace.groups.length === 0) {
//     const group1 = workspace.addGroup("Main Group");
//     // const group2 = workspace.addGroup("Second Group");
//     workspace.setActiveGroup(group1.id);

//     setTimeout(() => {
//       group1.newFile(
//         "",
//         "xml",
//         "http://localhost:5173/test/DMC-BRAKE-AAA-DA1-00-00-00AA-041A-A_003-00_EN-US.XML"
//       );
//       onFirstRendered();
//     }, 1000);
//   }
// });

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
