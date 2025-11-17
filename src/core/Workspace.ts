import * as monaco from "monaco-editor";
import { Group } from "./Group";
import { ModelIndex, WorkspaceObject } from "@/types/workspace";
import { GroupClass, TabClass } from "@/types/editor";
import { reactive } from "vue";

export function Workspace(): WorkspaceObject {
  const state = reactive({
    groups: <GroupClass[]>[],
    activeGroupId: <string | null>null,
  });

  return {
    get groups() {
      return state.groups;
    },
    get activeGroupId() {
      return state.activeGroupId;
    },
    get activeGroup(): GroupClass | null {
      return state.groups.find((t) => t.id === state.activeGroupId) ?? null;
    },
    get models(): ModelIndex[] {
      return state.groups.map(group => {
        const tabs = group.tabs
        return tabs.map(tab => {
          return {
            uri: tab.instance.model.uri.toString(),
            originalUri: tab.instance.originalModel?.uri.toString(),
            name: tab.instance.name,
            id: (tab.instance.model as monaco.editor.ITextModel).id || "",
            originalId: (tab.instance.originalModel)?.id || "",
          }
        })
      }).flat()
    },
    // 🧩 Tambah group baru
    addGroup(name?: string | null): GroupClass {
      if (!name) name = "group " + (state.groups.length + 1);
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
        state.activeGroupId = state.groups.at(-1)?.id ?? null;
      }
    }
  }
}
