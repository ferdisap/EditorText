import { Ref } from "vue";
import { GroupClass, TabClass } from "./editor.type";

export type WorkspaceClass = {
  groups: GroupClass[];
  activeGroupId: string | null;
  activeGroup: GroupClass | null;
  addGroup(name?: string): GroupClass;
  // addTabToGroup(groupId: string, tab: TabClass): void;
  setActiveGroup(groupId: string): void;
  closeGroup(groupId: string): void

  // setActiveTab(groupId: string, tabId: string): void
  models: { uri: string, name: string, id: string }[]
}

export type ModelIndex = {
  uri: string,
  originalUri?: string,
  name: string,
  id: string,
  originalId?: string,
}