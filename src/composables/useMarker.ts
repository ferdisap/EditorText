import * as monaco from "monaco-editor";
import { ref } from "vue";
import { ValidationInfo } from "xml-xsd-validator-browser";

const markerContainer = ref<HTMLDivElement | null>(null);

// key string adalah editor model id
const markerInfoMap = ref<Map<string, ValidationInfo[]>>(new Map());

// const markerMap :Map<string, HTMLDivElement> = new Map();

// export function goToErrorText(editor: CustomEditor, marker: monaco.editor.IMarkerData) {
//   editor.revealPositionInCenter({
//     lineNumber: marker.startLineNumber,
//     column: marker.startColumn,
//   });
//   editor.setPosition({
//     lineNumber: marker.startLineNumber,
//     column: marker.startColumn,
//   });
//   editor.focus();
// }
export function useMarker() {
  return {
    markerContainer, markerInfoMap
  }
}