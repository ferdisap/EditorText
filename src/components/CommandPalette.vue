/**
* @deprecated
*/

<script lang="ts" setup>
import { onMounted } from 'vue';

const commands = [
  {
    id: "openUri",
    label: "Open Original File by URI",
    action: () => prompt("Enter URI:"),
  },
  {
    id: "newFile",
    label: "Create New File",
    action: () => console.log("New File Created!"),
  },
  {
    id: "toggleTheme",
    label: "Toggle Dark/Light Theme",
    action: () => document.documentElement.classList.toggle("dark"),
  },
  // {
  //   id: "formatDocument",
  //   label: "Format Document",
  //   action: () => editor.getAction("editor.action.formatDocument").run(),
  // },
];
onMounted(() => {
  const overlay = document.getElementById("command-palette-overlay");
  const input = document.getElementById("command-input");
  const list = document.getElementById("command-list");
  let selectedIndex = 0;
  
  function renderList(filtered = commands) {
    list.innerHTML = "";
    filtered.forEach((cmd, idx) => {
      const li = document.createElement("li");
      li.className = "command-item" + (idx === selectedIndex ? " active" : "");
      li.textContent = cmd.label;
      li.onclick = () => executeCommand(cmd);
      list.appendChild(li);
    });
  }
  
  function executeCommand(cmd) {
    hidePalette();
    cmd.action?.();
  }
  
  function showPalette() {
    overlay.classList.remove("hidden");
    input.value = "";
    selectedIndex = 0;
    renderList();
    input.focus();
  }
  
  function hidePalette() {
    overlay.classList.add("hidden");
  }
  
  input.addEventListener("input", (e) => {
    const term = e.target.value.toLowerCase();
    const filtered = commands.filter((c) => c.label.toLowerCase().includes(term));
    selectedIndex = 0;
    renderList(filtered);
  });
  
  input.addEventListener("keydown", (e) => {
    const filtered = commands.filter((c) =>
      c.label.toLowerCase().includes(input.value.toLowerCase())
    );
    if (e.key === "ArrowDown") {
      selectedIndex = (selectedIndex + 1) % filtered.length;
      renderList(filtered);
    } else if (e.key === "ArrowUp") {
      selectedIndex = (selectedIndex - 1 + filtered.length) % filtered.length;
      renderList(filtered);
    } else if (e.key === "Enter") {
      executeCommand(filtered[selectedIndex]);
    } else if (e.key === "Escape") {
      hidePalette();
    }
  });
  setTimeout(() => {
    console.log('show command palette')
    showPalette();
  },1000)
  // window.addEventListener("keydown", (e) => {
  //   if (e.key === "F1") {
  //     e.preventDefault();
  //     showPalette();
  //   }
  // });
})


</script>

<template>
  <!-- Command Palette Overlay -->
  <div
    id="command-palette-overlay"
    class="hidden fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
  >
    <div
      id="command-palette"
      class="absolute top-[20%] left-1/2 -translate-x-1/2 w-[600px] max-w-[90%] bg-[var(--vscode-editor-background,#1e1e1e)] text-[var(--vscode-editor-foreground,#d4d4d4)] border border-[var(--vscode-editorWidget-border,#333)] rounded-lg shadow-lg overflow-hidden transition-all duration-150"
    >
      <input
        id="command-input"
        type="text"
        placeholder="Type a command..."
        class="w-full px-4 py-3 text-sm bg-transparent outline-none border-b border-[var(--vscode-input-border,#3c3c3c)] placeholder-gray-400"
      />

      <ul id="command-list" class="max-h-[300px] overflow-y-auto">
        <!-- Command items will be injected here dynamically -->
      </ul>
    </div>
  </div>
</template>
