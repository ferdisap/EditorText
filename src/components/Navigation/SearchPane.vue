<script setup lang="ts">
import { ref } from "vue";

interface SearchResult {
  file: string;
  line: number;
  preview: string;
}

const query = ref("");
const results = ref<SearchResult[]>([]);
const loading = ref(false);

function runSearch() {
  if (!query.value) return;
  loading.value = true;

  setTimeout(() => {
    // dummy results — integrate with your model registry
    results.value = [
      {
        file: "src/App.vue",
        line: 12,
        preview: 'const foo = "bar";',
      },
      {
        file: "src/main.ts",
        line: 3,
        preview: 'import { createApp } from "vue"',
      },
    ];
    loading.value = false;
  }, 300);
}

function select(res: SearchResult) {
  // callback: open file or jump to location
  console.log("open", res);
}
</script>
<template>
  <div class="search-pane h-full flex flex-col overflow-hidden">
    <div class="search-bar p-2 border-b flex items-center gap-2">
      <input
        v-model="query"
        @keydown.enter="runSearch"
        class="search-input flex-1 px-2 py-1 rounded bg-[var(--vscode-input-background)] text-[var(--vscode-input-foreground)] border border-[var(--vscode-input-border)]"
        placeholder="Search..."
      />
      <button
        class="icon-btn codicon codicon-search"
        @click="runSearch"
      ></button>
    </div>

    <div class="search-results flex-1 overflow-auto text-sm">
      <div v-if="loading" class="p-3 opacity-70">Searching...</div>
      <div v-else-if="results.length === 0 && query" class="p-3 opacity-70">
        No results
      </div>

      <div
        v-for="(res, idx) in results"
        :key="idx"
        class="result-item px-3 py-1 border-b cursor-pointer hover:bg-[var(--vscode-list-hoverBackground)]"
        @click="select(res)"
      >
        <div class="font-medium">{{ res.file }}</div>
        <div class="text-xs opacity-80">
          Line {{ res.line }} — {{ res.preview }}
        </div>
      </div>
    </div>
  </div>
</template>
