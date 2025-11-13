import { useTheme } from "@/composables/useTheme";
import { Trait } from "@/types/trait";
import * as monaco from "monaco-editor";
import { createEditorContainer, getEditorContainer } from "@/composables/useEditorContainer";
import { EditorTab } from "@/core/EditorTab";
import { useWorkspace } from "@/composables/useWorkspace";
import { EditorClass, MonacoCodeEditor, MonacoEditor, MonacoTextModel, TabClass } from "@/types/editor";

const { toggleTheme } = useTheme();

export function duplicateEditor(editor:monaco.editor.IStandaloneCodeEditor, lang:string | null = null) :monaco.editor.IStandaloneCodeEditor{

  // save old config
  const previousViewState = editor?.saveViewState() ?? null;
  const cursor = editor.getPosition(); // Simpan posisi kursor
  const options = editor.getRawOptions(); 

  // create new editor
  editor = monaco.editor.create(createEditorContainer(), options); // tidak bisa pakai container yang lama, jika belum di dispose. Jika didispose dahulu sebelum duplicate element, maka model atau option juga hilang 
  const model = editor.getModel()!;
  if(lang) monaco.editor.setModelLanguage(model!, lang);
  editor.setModel(model);

  // restoring view editor
  if (previousViewState) {
    editor.restoreViewState(previousViewState);
  }

  // set last cursor position
  if (cursor) {
    editor.setPosition(cursor);
  }

  // layouting and make editor focus again
  editor.layout();
  editor.focus();
  return editor
}

/**
 * @deprecated, pindah ke Editor.ts
 * @param tab 
 * @param lang 
 * @returns 
 */
export function changeLanguage(tab: TabClass, lang: string) {
  const editorInstance = tab.instance;
  if(!editorInstance.isCodeEditor) return;
  const container = getEditorContainer(editorInstance);
  let editor :MonacoCodeEditor = editorInstance.editor as MonacoCodeEditor;

  // change language model
  const model :MonacoTextModel = editorInstance.editor.getModel() as MonacoTextModel;
  monaco.editor.setModelLanguage(model!, lang);
  
  // save old config
  const previousViewState = editor?.saveViewState() ?? null;
  const cursor = editor.getPosition(); // Simpan posisi kursor
  const options = editor.getRawOptions(); 
  // options.theme = 'vs-dark'
  
  // dispose only monaco editor
  editor.dispose();

  // re create monaco editor
  editor = monaco.editor.create(container as HTMLDivElement, options);
  editor.setModel(model);
  // const neweditor = duplicateEditor(container, editor, lang);

  // restoring view editor
  if (previousViewState) {
    editor.restoreViewState(previousViewState);
  }

  // set last cursor position
  if (cursor) {
    editor.setPosition(cursor);
  }

  // layouting and make editor focus again
  editor.layout();
  editor.focus();

  tab.instance.editor = editor
  // tab.instance.changeMonacoEditor(editor);
}

function actionThemeContextMenu(editor: MonacoEditor ) {
  editor.addAction({
    id: "toggle-theme",
    label: `Switch Theme ☀️ or 🌙`,
    contextMenuGroupId: "6_configuration", // atau "custom" sesuai selera
    contextMenuOrder: 1.1,
    run: () => {
      toggleTheme()
    },
  })
}

function actionNewTabContextMenu(editor: MonacoEditor) {
  editor.addAction({
    id: "new-tab",
    label: `New File`,
    contextMenuGroupId: "navigation", // atau "custom" sesuai selera
    contextMenuOrder: 1.1,
    run: () => {
      const { workspace } = useWorkspace();
      const group = workspace.activeGroup!;
      group.newFile('','','');
    },
  })
}

function actionSplitEditor(editor: MonacoCodeEditor){
    editor.addAction({
    id: "split-tab",
    label: `Split`,
    contextMenuGroupId: "navigation", // atau "custom" sesuai selera
    contextMenuOrder: 1.2,
    run: () => {
      const { workspace } = useWorkspace();
      const group = workspace.activeGroup!;
      group.splitFile(editor.getModel()!.uri.toString());
    },
  })
}

const registeredGeneralAction: WeakMap<(editor: any) => void, boolean> = new WeakMap();
const additionalGeneralAction: Record<string, (editor: any) => void> = {};

export function registerGeneralAction(name:string, action: (editor: any) => void){
  additionalGeneralAction[name] = action;
}

export function init(this: EditorClass) {
  actionThemeContextMenu(this.editor);
  registeredGeneralAction.set(actionThemeContextMenu, true)
  actionNewTabContextMenu(this.editor)
  registeredGeneralAction.set(actionNewTabContextMenu, true)
  if(this.isCodeEditor){
    actionSplitEditor(this.editor as MonacoCodeEditor)
    registeredGeneralAction.set(actionSplitEditor, true)
  }

  for(const name of Object.keys(additionalGeneralAction)){
    if(!registeredGeneralAction.has(additionalGeneralAction[name])){
      additionalGeneralAction[name](this.editor);
      registeredGeneralAction.set(additionalGeneralAction[name], true);
    }
  }
}