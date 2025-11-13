import { Ref, ref } from "vue";
import { useModelStore } from "./useModelstore";
import { getFilenameFromUri, randStr } from "@/util/string";
import * as monaco from "monaco-editor";
import { EditorClass, MonacoCodeEditor, MonacoTextModel, TabClass } from "@/types/editor";
import { Tab } from "@/core/Tab";
import { Editor } from "@/core/Editor";
import { MapModelEditor } from "@/types/model";

// 1. Define Golbal Worker management
const EditorMainContainerMap: Map<string, Ref<HTMLDivElement|null>> = new Map();
// const EditorMainContainerMap: Map<string, Ref<VNode>> = new Map();

// const editorMainContainer = ref<HTMLDivElement | null>(null);
// const editorMainContainer = {value: null}
// const EDITOR_CONTAINER_CSS_CLASS = 'editor-container';
const EDITOR_CONTAINER_CSS_CLASS = 'editor-wrapper';
export const EDITOR_MAIN_CONTAINER_CSS_CLASS = 'editor-main';

export function getEditorContainer(editor: EditorClass | monaco.editor.IStandaloneCodeEditor): HTMLElement | null {
  let domNode: HTMLElement | null;
  if ((editor as EditorClass).id) {
    domNode = ((editor as EditorClass).editor as monaco.editor.IStandaloneCodeEditor).getDomNode();
  } else {
    console.log((editor as monaco.editor.IStandaloneCodeEditor).getDomNode());
    domNode = (editor as monaco.editor.IStandaloneCodeEditor).getDomNode();
  }
  if (domNode) {
    return domNode.closest(`.${EDITOR_CONTAINER_CSS_CLASS}`)! as HTMLElement;
  }
  return null
}

export function createEditorContainer(): HTMLDivElement {
  const div = document.createElement('div');
  div.style.width = "100%";
  div.style.height = "100%";
  div.setAttribute('id', randStr(10));
  div.classList.add(EDITOR_CONTAINER_CSS_CLASS)
  return div
}

// function createEditorMainContainer(): HTMLDivElement {
//   const div = document.createElement('div');
//   div.classList.add(EDITOR_MAIN_CONTAINER_CSS_CLASS)
//   return div
// }

export function useEditorContainer(groupId: string) {
  if (!EditorMainContainerMap.has(groupId)) {
    EditorMainContainerMap.set(groupId, ref(null));
  }

  const edMainContainer = ref(EditorMainContainerMap.get(groupId)!);

  function createEditorInstance(value: string = '', language: string = 'plaintext', uri: string = ''): TabClass | void {
    const { modelStore } = useModelStore();
    if (!edMainContainer) return;
    // create div container
    const div = createEditorContainer();
    edMainContainer.value!.innerHTML = '';
    edMainContainer.value!.appendChild(div);
    // create editorInstance
    const modelId = modelStore.createModel(value, language, uri);
    const editorId = randStr(10);
    const name = getFilenameFromUri(uri, "Untitled");
    const editorInstance = Editor(editorId, name, modelId, div);
    // store map editor and id
    modelStore.mapModelAndEditor(modelId, [editorId]) as Array<MapModelEditor>;
    // init general and apply trait
    editorInstance.init();
    // create Tab
    const tab = Tab(editorInstance);
    return tab;
  }

  function createEditorInstanceWithModel(modelOrUriOrId:string|MonacoTextModel, name:string|null = null): TabClass | void {
    // console.log(modelOrUriOrId);
    const { modelStore } = useModelStore();
    if (!edMainContainer) return;
    // create div container
    const div = createEditorContainer();
    edMainContainer.value!.innerHTML = '';
    edMainContainer.value!.appendChild(div);
    // create editorInstance
    
    let model: MonacoTextModel;
    if(typeof modelOrUriOrId === 'string'){
      model = modelStore.getModel(modelOrUriOrId) as MonacoTextModel;
    } else model = modelOrUriOrId;
    const editorId = randStr(10);
    if(!name) name = getFilenameFromUri(modelOrUriOrId as string, 'Untitled');
    const editorInstance = Editor(editorId, name, model, div);
    // store map editor and id
    modelStore.mapModelAndEditor(model.id, [editorId]) as Array<MapModelEditor>;
    console.log(model.uri.toString())
    // init general and apply trait
    editorInstance.init();
    // create Tab
    const tab = Tab(editorInstance);
    return tab;
  }

  function attachToEl(tab: TabClass | null) {
    if (!tab) return;
    const editorContainer = getEditorContainer(tab.instance)
    if (editorContainer) {
      editorContainer.classList.add(EDITOR_CONTAINER_CSS_CLASS);
      edMainContainer.value?.appendChild(editorContainer);
      // tab.instance.editor.layout();
    }
  }
  function detachFromEl(tab: TabClass | null) {
    if (!tab) return;
    const editorInstance = tab.instance;
    const domNode = (editorInstance.editor as MonacoCodeEditor).getDomNode();
    if (domNode && edMainContainer.value?.children) {
      edMainContainer.value.innerHTML = ''
    }
  }

  return {
    createEditorInstanceWithModel, createEditorInstance, attachToEl, detachFromEl,
    get editorMainContainer() {
      return edMainContainer;
    }
  };
}
