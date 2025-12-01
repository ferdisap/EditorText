import { executeOnNavContentResized } from '@js-editor/plugins/sidebar.plugin';
import { ref } from 'vue';


/**
* Simple drag-to-resize composable for a left side panel.
* Usage: pass a ref to the panel element and initial width (px)
*/
export function useResizePanel(panelRef: any, initial = 260) {
  const resizing = ref(false);
  let startX = 0;
  let startWidth = initial;
  let panelEl: HTMLElement | null = null;
  let delta:number = 0;

  function startResize(e: PointerEvent | MouseEvent) {
    resizing.value = true;
    startX = (e as PointerEvent).clientX || (e as MouseEvent).clientX;
    panelEl = panelRef.value as HTMLElement;
    startWidth = panelEl?.getBoundingClientRect().width ?? initial;
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', stopResize);
  }


  function onMove(e: MouseEvent) {
    if (!resizing.value || !panelEl) return;
    delta = (e.clientX - startX);
    const newWidth = Math.max(180, startWidth + delta);
    panelEl.style.width = `${newWidth}px`;
  }


  function stopResize() {
    if (!resizing.value) return;
    resizing.value = false;
    window.removeEventListener('mousemove', onMove);
    window.removeEventListener('mouseup', stopResize);

    executeOnNavContentResized(delta);
  }


  return { startResize, stopResize };
}