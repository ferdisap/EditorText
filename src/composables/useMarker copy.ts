import * as monaco from "monaco-editor";
import { ref } from "vue";
import { ValidationInfo } from "xml-xsd-validator-browser";
import { useModelStore } from "./useModelstore";
import { useWorkspace } from "./useWorkspace";

const markerContainer = ref<HTMLDivElement | null>(null);

// key string adalah editor model id
const markerInfoMap = ref<Map<string, ValidationInfo[]>>(new Map());

export function goto(modelId: string, line: number, col: number) {
  const { modelStore } = useModelStore();
  const map = modelStore.mapModelAndEditor(modelId, null)[0];
  let editorId: string;
  editorId = map.editorsInstancesId[0];
  const { workspace } = useWorkspace();
  const group = workspace.groups.filter(group => {
    return group.tabs.filter(tab => {
      return tab.instance.id === editorId;
    })
  })[0];
  if (group) {
    const tab = group.tabs.find(tab => tab.instance.id === editorId);
    if (tab) {
      // activate tab and group
      group.setActiveTab(tab.id);
      workspace.setActiveGroup(group.id);
      // position and goto line
      setTimeout(() => {
        tab.instance.goto({ lineNumber: line, column: col });
      }, 100)
    }
  }

}

export function useMarker() {
  return {
    markerContainer, markerInfoMap
  }
}