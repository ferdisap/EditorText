import * as monaco from "monaco-editor";
import { useTheme } from "@/composables/useTheme";
import { createEditorContainer, getEditorContainer } from "@/composables/useEditorContainer";
import { useWorkspace } from "@/composables/useWorkspace";
import { EditorClass, MonacoCodeEditor, MonacoEditor, MonacoTextModel, TabClass } from "@/types/editor";
import { detectLanguage } from "@/languages/detection";
import { applyTraitOnInstanced, deApplyTraitOnInstanced } from "../apply";
import { ModelLanguage } from "@/types/model";
import { applyAction, deApplyAction, registerAction } from "@/plugins/action.plugin";
import { applyPluginOnDidChangeModelContent, deApplyPluginOnDidChangeModelContent, registerPluginOnDidChangeModelContent } from "@/plugins/onDidChangeModelContent.plugin";

const { toggleTheme } = useTheme();

// export function duplicateEditor(editor: monaco.editor.IStandaloneCodeEditor, lang: string | null = null): monaco.editor.IStandaloneCodeEditor {
//   // save old config
//   const previousViewState = editor?.saveViewState() ?? null;
//   const cursor = editor.getPosition(); // Simpan posisi kursor
//   const options = editor.getRawOptions();

//   // create new editor
//   editor = monaco.editor.create(createEditorContainer(), options); // tidak bisa pakai container yang lama, jika belum di dispose. Jika didispose dahulu sebelum duplicate element, maka model atau option juga hilang 
//   const model = editor.getModel()!;
//   if (lang) monaco.editor.setModelLanguage(model!, lang);
//   editor.setModel(model);

//   // restoring view editor
//   if (previousViewState) {
//     editor.restoreViewState(previousViewState);
//   }

//   // set last cursor position
//   if (cursor) {
//     editor.setPosition(cursor);
//   }

//   // layouting and make editor focus again
//   editor.layout();
//   editor.focus();
//   return editor
// }

function actionThemeContextMenu(editorInstance: EditorClass) {
  return editorInstance.editor.addAction({
    id: "toggle.theme",
    label: `Switch Theme ☀️ or 🌙`,
    contextMenuGroupId: "6_configuration", // atau "custom" sesuai selera
    contextMenuOrder: 1.1,
    run: () => {
      toggleTheme()
    },
  })
}

function actionNewTabContextMenu(editorInstance: EditorClass) {
  return editorInstance.editor.addAction({
    id: "new.tab",
    label: `New File`,
    contextMenuGroupId: "navigation", // atau "custom" sesuai selera
    contextMenuOrder: 1.1,
    run: () => {
      const { workspace } = useWorkspace();
      const group = workspace.activeGroup!;
      group.newFile('', '', '');
    },
  })
}

function actionSplitEditor(editorInstance: EditorClass) {
  if (editorInstance.isCodeEditor) {
    return editorInstance.editor.addAction({
      id: "split.tab",
      label: `Split`,
      contextMenuGroupId: "navigation", // atau "custom" sesuai selera
      contextMenuOrder: 1.2,
      run: () => {
        const { workspace } = useWorkspace();
        const group = workspace.activeGroup!;
        group.splitFile((editorInstance.editor as MonacoCodeEditor).getModel()!.uri.toString());
      },
    })
  }
}

registerAction('toggle.theme', actionThemeContextMenu);
registerAction('new.tab', actionNewTabContextMenu);
registerAction('split.tab', actionSplitEditor);

export function init(this: EditorClass) {
  applyAction.apply(this);
  
  const namespacePlugin = `detect.language.${this.id}`;
  // console.log(namespacePlugin);
  registerPluginOnDidChangeModelContent(namespacePlugin, () => {
    return detectLanguage(this, (model, lang) => {
      deApplyTraitOnInstanced(this);
      // changeLanguage(myTab, lang);
      this.changeLanguage(lang as ModelLanguage);
      applyTraitOnInstanced(this);
      // this.init();
    });
  })
  applyPluginOnDidChangeModelContent.apply(this)

}

export function deInit(this: EditorClass) {
  deApplyAction.apply(this, [null, false]);

  const namespacePlugin = `detect.language.${this.id}`;
  deApplyPluginOnDidChangeModelContent.apply(this, [namespacePlugin, true])
}