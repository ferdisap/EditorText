<script setup lang="ts">
const props = defineProps<{ active?: string }>();
const emits = defineEmits(["select"]);

const items = [
  { id: "explorer", label: "Explorer", icon: "codicon-files" },
  { id: "search", label: "Search", icon: "codicon-search" },
  { id: "scm", label: "Source Control", icon: "codicon-source-control" },
  { id: "extensions", label: "Extensions", icon: "codicon-extensions" },
];
</script>

<template>
  <div class="nav-menu flex flex-col items-center py-2 gap-2">
    <button
      v-for="item in items"
      :key="item.id"
      :class="['nav-menu-item', { active: item.id === active }]"
      @click="$emit('select', item.id)"
      :title="item.label"
    >
      <i :class="['codicon', item.icon]"></i>
    </button>
  </div>
</template>

