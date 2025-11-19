<script setup lang="ts">
import GroupWorkspace from "./Explorer/GroupWorkspace.vue";
import TreeWorkspace from "./Explorer/TreeWorkspace.vue";

</script>
<template>
  <div class="explorer-pane">
    <GroupWorkspace/>
    <div class="mt-1 mb-1 border-b border-2 border-[var(--vscode-panel-border)]"></div>
    <TreeWorkspace/>
  </div>
</template>
