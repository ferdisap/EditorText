import * as monaco from "monaco-editor";
import { Group } from "./Group";
import { ModelIndex, WorkspaceObject } from "@/types/workspace";
import { GroupClass, TabClass } from "@/types/editor";
import { reactive } from "vue";

export function Workspace(): WorkspaceObject {
  // const _groups: Ref<Array<GroupClass>> = ref([]);
  // const _activeGroupId: Ref<string | null> = ref<string | null>(null);
  // let _groups: GroupClass[] = ([]);
  // let _activeGroupId: string | null = (null);
  const state = reactive({
    groups: <GroupClass[]>[],
    activeGroupId: <string | null> null,
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
            uri: (tab.instance.editor.getModel()! as monaco.editor.ITextModel).uri.toString() || "",
            name: tab.instance.name,
            id: (tab.instance.editor.getModel()! as monaco.editor.ITextModel).id || ""
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
      return group;
    },
    // 🧩 Tambah tab ke group
    addTabToGroup(groupId: string, tab: TabClass) {
      const group = state.groups.find((g) => g.id === groupId);
      if (!group) throw new Error(`Group not found: ${groupId}`);

      const exists = group.tabs.find((t) => t.id === tab.id);
      if (!exists) group.tabs.push(tab);
      group.activeTabId = tab.id;
    },
    // 🧭 Set tab aktif di group
    /**
     * @deprecated seharusnya ada di groupclass
     * @param groupId 
     * @param tabId 
     */
    setActiveTab(groupId: string, tabId: string) {
      const group = state.groups.find((g) => g.id === groupId);
      if (group) group.activeTabId = tabId;
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
