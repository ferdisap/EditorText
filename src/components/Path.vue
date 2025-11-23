<script setup lang="ts">
import { type GroupClass } from "@/types/editor.type";
import { computed } from "vue";

const props = defineProps<{
  group: GroupClass;
}>();

const path = computed(() => {
  if (props.group.activeTab?.instance.isCodeEditor) {
    return props.group.activeTab?.instance.model.uri.toString();
  } else {
    return props.group.activeTab?.instance.originalModel!.uri.toString() + ' ———> ' + props.group.activeTab?.instance.model.uri.toString();
  }
});
</script>
<template>
  <div class="editor-path">
    <span class="path-uri">{{ path }}</span>
  </div>
</template>
