import * as monaco from "monaco-editor";
import { GroupClass, TabClass } from "@/types/editor";
import { useWorkspace } from "@/composables/useWorkspace";
import { getFilenameFromUri, randStr } from "@/util/string";
import { useEditorContainer } from "@/composables/useEditorContainer";
import { reactive } from "vue";

export function Group(name: string): GroupClass {
  const state = reactive({
    id: randStr(10),
    name: name,
    tabs: <TabClass[]>[],
    activeTabId: <string | undefined>undefined,
  });
  return {
    get id() {
      return state.id
    },

    get name() {
      return state.name;
    },

    get tabs() {
      return state.tabs;
    },

    get activeTabId() {
      return state.activeTabId;
    },

    get activeTab() {
      return state.tabs.find((tab) => tab.id === state.activeTabId) as TabClass;
    },

    addTab(tab: TabClass) {
      state.tabs.push(tab);
      state.activeTabId = tab.id;
    },

    setActiveTab(tabId: string) {
      if (state.tabs.find((t) => t.id === tabId)) {
        state.activeTabId = tabId;
      }
    },

    closeTab(tabId: string) {
      const tab = state.tabs.find((t) => t.id === tabId);
      if (!tab) return;
      tab.close();
      let closedTabsIndex: number = state.tabs.indexOf(tab);
      state.tabs.splice(closedTabsIndex, 1)
      if (state.activeTabId === tabId) {
        state.activeTabId = state.tabs.at(-1)?.id ?? undefined;
      }
    },

    newFile(value: string = '', language: string = 'plaintext', uri: string = ''): TabClass | void {
      const { editorMainContainer, createEditorInstance, detachFromEl } = useEditorContainer(state.id);
      if (editorMainContainer.value) {
        // detach previous active editor
        if (this.activeTab) detachFromEl(this.activeTab);

        // create new editor and tab
        const tab = createEditorInstance(value, language, uri);
        if (!tab) return;
        this!.addTab(tab);

        // set new active tab
        this?.setActiveTab(tab.id);

        // layouting and focus
        tab.instance.layout();
        tab.instance.focus();
        return tab;
      }
    },

    splitFile(modelUri: string, name: string | null = null): TabClass | void {
      const { workspace } = useWorkspace();
      const currentIndexGroup = workspace.groups.findIndex((group) => group === this);
      let group: GroupClass | undefined;
      // jika tidak bikin group baru, jika ada next group maka pakai group itu
      if (!(group = workspace.groups[currentIndexGroup + 1])) {
        group = workspace.addGroup();
        workspace.setActiveGroup(group.id);
      }

      const { editorMainContainer, createEditorInstanceWithModel, detachFromEl } = useEditorContainer(group.id);
      // pakai setTimeout karena vue butuh render
      setTimeout(() => {
        if (editorMainContainer.value) {
          // detach previous active editor
          if (group.activeTab) detachFromEl(group.activeTab);
          // create new editor and tab
          if (!name) {
            name = getFilenameFromUri(modelUri, 'Untitled');
            if(!isNaN(Number(name))){
              name = 'Untitled'
            }
          };
          const tab = createEditorInstanceWithModel(modelUri, name);
          if (!tab) return;
          group!.addTab(tab);
          // set new active tabpApp
          group.setActiveTab(tab.id);
          // layouting and focus
          tab.instance.layout();
          tab.instance.focus();
          return tab;
        }
      }, 10);
    },

    compareFile(originalUri: string, modifiedUri: string): TabClass | void {
      const { workspace } = useWorkspace();
      const currentIndexGroup = workspace.groups.findIndex((group) => group === this);
      let group: GroupClass | undefined;
      // jika tidak bikin group baru, jika ada next group maka pakai group itu
      if (!(group = workspace.groups[currentIndexGroup + 1])) {
        group = workspace.addGroup();
        workspace.setActiveGroup(group.id);
      }

      const { editorMainContainer, createDiffEditorInstance, detachFromEl } = useEditorContainer(group.id);
      setTimeout(() => {
        if (editorMainContainer.value) {
          // detach previous active editor
          if (group.activeTab) detachFromEl(group.activeTab);
          // create new editor and tab
          const tab = createDiffEditorInstance(originalUri, modifiedUri);
          if (!tab) return;
          group!.addTab(tab);
          // set new active tab
          group.setActiveTab(tab.id);
          // layouting and focus
          tab.instance.layout();
          tab.instance.focus();
          return tab;
        }
      }, 10)
    },

    disposeAll() {
      for (const t of state.tabs) t.close();
      state.tabs.splice(0, state.tabs.length)
    }
  }
}