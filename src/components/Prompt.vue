<script lang="ts" setup>
import { usePrompt } from "@/composables/usePrompt";
import { onMounted, ref } from "vue";

const { vmodel, placeholder, input, post, onSubmit, onCancel } = usePrompt();

// top.ws.post = post;

</script>

<template>
  <div
    id="prompt-overlay"
    class="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
  >
    <div
      id="prompt"
      class="absolute top-[20%] left-1/2 -translate-x-1/2 w-[600px] max-w-[90%] bg-[var(--vscode-editor-background,#1e1e1e)] text-[var(--vscode-editor-foreground,#d4d4d4)] border border-[var(--vscode-editorWidget-border,#333)] rounded-lg shadow-lg overflow-hidden transition-all duration-150"
    >
      <input
        ref="input"
        v-model="vmodel"
        @keyup.enter="onSubmit"
        @keyup.esc="onCancel"
        type="text"
        :placeholder="placeholder"
        class="w-full px-4 py-3 text-sm bg-transparent outline-none border-b border-[var(--vscode-input-border,#3c3c3c)] placeholder-gray-400"
      />
    </div>
  </div>
</template>
