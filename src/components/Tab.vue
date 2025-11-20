<script setup lang="ts">
import { useWorkspace } from "@/composables/useWorkspace";
import { GroupClass } from "@/types/editor.type";
import { computed, onMounted, watch } from "vue";

const props = defineProps<{ group: GroupClass }>();

const close = (tabId:string) => {
  const { workspace } = useWorkspace();
  if(workspace.groups.length > 1 || props.group.tabs.length > 1){
    props.group.closeTab(tabId);
    if(props.group.tabs.length === 0){
      workspace.closeGroup(props.group.id);
    }
  }
}

const tabs = computed(() => props.group.tabs);

const select = (tabId:string) => {
  props.group.setActiveTab(tabId);
}

// onMounted(() => {
  // http://localhost:5173/test/purchaseOrder.xml
  // const uri = "http://localhost:5173/test/purchaseOrder.xml";
  // fetch(uri).then(r => r.text()).then(text => 
  // props.group.newFile(text, 'xml', uri)
  // )
  // props.group.newFile();
// })
</script>

<template>
  <div class="editor-tabs">
    <div
      v-for="tab in tabs"
      :key="tab.id"
      :class="[
        'tab-item',
        { active: tab.id === props.group.activeTabId }
      ]"
      @click="select(tab.id)"
    >
      <span class="tab-name">{{ tab.name }}</span>
      <!-- <span class="tab-uri">&nbsp;{{ tab.instance.editor.getModel()?.uri }}</span> -->
      <div class="tab-action">
        <button
          class="tab-close"
          @click.stop="close(tab.id)"
          title="Close"
        >
          ×
        </button>
      </div>
       <!-- <button class="close-btn" @click.stop="$emit('close', tab.id)">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 0 1 1.414 0L10 8.586l4.293-4.293a1 1 0 0 1 1.414 
          1.414L11.414 10l4.293 4.293a1 1 0 0 1-1.414 1.414L10 
          11.414l-4.293 4.293a1 1 0 0 1-1.414-1.414L8.586 
          10 4.293 5.707a1 1 0 0 1 0-1.414z" clip-rule="evenodd" />
        </svg>
      </button> -->
    </div>
  </div>
</template>