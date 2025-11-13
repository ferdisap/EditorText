import { ref, onMounted } from "vue";
import * as monaco from "monaco-editor";

// const isDark = ref(false);
const storageName = 'ferdi-editor-theme';
const isDark = ref(localStorage.getItem(storageName) === "dark");

export function useTheme() {

  function toggleTheme() {
    isDark.value = !isDark.value
    localStorage.setItem(storageName, isDark.value ? "dark" : "light")
    applyTheme()
  }

  function applyDarkTheme(){
    isDark.value = true;
    localStorage.setItem(storageName, isDark.value ? "dark" : "light")
    applyTheme();
  }

  function applyLightTheme(){
    isDark.value = false;
    localStorage.setItem(storageName, isDark.value ? "dark" : "light")
    applyTheme();
  }

  function applyTheme() {
    if (isDark.value) {
      document.documentElement.classList.add("dark")
      monaco.editor.setTheme("vs-dark"); // or "vs"
    } else {
      document.documentElement.classList.remove("dark")
      monaco.editor.setTheme("vs"); // or "vs"
    }
  }

  return { isDark, applyTheme, toggleTheme, applyDarkTheme, applyLightTheme }
}
