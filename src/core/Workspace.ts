import * as monaco from "monaco-editor";
import { Group } from "./Group";
import { type ModelIndex, type WorkspaceClass } from "@js-editor/types/workspace.type";
import { type GroupClass, type TabClass } from "@js-editor/types/editor.type";
import { reactive } from "vue";

export type WSpaceDataProp = {
  groups: {
    editors: {
      type: "text" | "compare";
      uri?: string;
      originalUri?: string;
    }[];
  }[];
};

export function Workspace(): WorkspaceClass {
  const state = reactive({
    groups: <any[]>[],
    activeGroupId: <string | null>null,
  });

  return {
    get groups() {
      return state.groups as unknown as GroupClass[];
    },
    get activeGroupId() {
      return state.activeGroupId;
    },
    get activeGroup(): GroupClass | null {
      return (state.groups.find((t) => t.id === state.activeGroupId) as unknown as GroupClass)  ?? null;
    },
    get models(): ModelIndex[] {
      const modelsId:string[] = []
      return state.groups.map(group => {
        const tabs = group.tabs
        return tabs.map((tab:TabClass) => {
          const id = (tab.instance.model as monaco.editor.ITextModel).id || "";
          if(modelsId.find((i) => i === id)){
            return null;
          }
          else {
            modelsId.push(id)
            return {
              uri: tab.instance.model.uri.toString(),
              originalUri: tab.instance.originalModel?.uri.toString(),
              name: tab.instance.name,
              id,
              originalId: (tab.instance.originalModel)?.id || "",
            }
          }
        })
      }).flat().filter(v => v) as ModelIndex[];
    },
    // 🧩 Tambah group baru
    addGroup(name?: string | null): GroupClass {
      if (!name) name = "Group " + (state.groups.length + 1);
      const group = Group(name);
      state.groups.push(group);
      state.activeGroupId = group.id;
      // console.log(group === this.activeGroup!) // false
      // return group;
      return this.activeGroup!;
    },
    // 🧭 Set group aktif
    setActiveGroup(groupId: string) {
      state.activeGroupId = groupId;
    },
    // ❌ Tutup group
    closeGroup(groupId: string) {
      const group = state.groups.find((g) => g.id === groupId);
      if (!group) return;

      for (const tab of group.tabs) {
        tab.close();
      }

      state.groups = state.groups.filter((g) => g.id !== groupId);
      if (state.activeGroupId === groupId) {
        state.activeGroupId = state.groups[state.groups.length - 1]?.id ?? null;
      }
    }
  }
}
