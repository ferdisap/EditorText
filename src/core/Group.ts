import * as monaco from "monaco-editor";
import { GroupClass, TabClass, Dimension } from "@/types/editor";
import { useWorkspace } from "@/composables/useWorkspace";
import { getFilenameFromUri, randStr } from "@/util/string";
import { useEditorContainer } from "@/composables/useEditorContainer";
import { nextTick, reactive, ref } from "vue";

function calcDimension(totalGroupQty = 1, max = 100) :number{
  return (1 / totalGroupQty) * max;
}

export function Group(name: string): GroupClass {
  const { workspace } = useWorkspace();
  const totalGroupQty = workspace.groups.length | 1;
  const _container = ref<HTMLElement | null>(null);
  const state = reactive({
    id: randStr(10),
    name: name,
    tabs: <TabClass[]>[],
    activeTabId: <string | undefined>undefined,
    dimension: {
      width: {
        size: calcDimension(totalGroupQty),
        unit: "%",
      },
      height: {
        size: calcDimension(totalGroupQty),
        unit: "%",
      },
    }
  });
  return {
    get id() {
      return state.id
    },
    get container(){
      return _container;
    },
    get dimension(){
      return state.dimension
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

    /** set the maximum dimension on option */
    layout(width?: Dimension, height?:Dimension){
      const { workspace } = useWorkspace();
      const totalGroupQty = workspace.groups.length || 1;
      if(width){
        state.dimension.width.unit = width.unit;
        state.dimension.width.size = calcDimension(totalGroupQty, width.size);
      } else {
        state.dimension.width.size = calcDimension(totalGroupQty, _container.value?.clientWidth);
      }
      if(height){
        state.dimension.height.unit = height.unit;
        state.dimension.height.size = calcDimension(totalGroupQty, height.size);
      } else {
        state.dimension.width.size = calcDimension(totalGroupQty, _container.value?.clientHeight);
      }
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
      const { workspace, relayout } = useWorkspace();
      // const currentIndexGroup = workspace.groups.findIndex((group) => group === this);
      const currentIndexGroup = workspace.groups.findIndex((group) => group.id === state.id);
      let group: GroupClass | undefined;
      // jika tidak bikin group baru, jika ada next group maka pakai group itu
      if (!(group = workspace.groups[currentIndexGroup + 1] as unknown as GroupClass)) {
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

          relayout();
          return tab;
        }
      }, 10);
    },

    compareFile(originalUri: string, modifiedUri: string): TabClass | void {
      const { editorMainContainer, createDiffEditorInstance, detachFromEl } = useEditorContainer(this.id);
      setTimeout(() => {
        if (editorMainContainer.value) {
          // detach previous active editor
          if (this.activeTab) detachFromEl(this.activeTab);
          // create new editor and tab
          const tab = createDiffEditorInstance(originalUri, modifiedUri);
          if (!tab) return;
          this.addTab(tab);
          // set new active tab
          this.setActiveTab(tab.id);
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