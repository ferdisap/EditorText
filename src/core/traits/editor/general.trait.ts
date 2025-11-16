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
import { getShortCut } from "@/config/shortcut";
import { usePrompt } from "@/composables/usePrompt";

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
    id: "new.file",
    label: `New File`,
    contextMenuGroupId: "navigation", // atau "custom" sesuai selera
    contextMenuOrder: 1.1,
    keybindings: getShortCut("new.file", [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyD]),
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

function removeFilenameFromUrl(url: string): string {
  try {
    const urlObject = new URL(url);
    const pathSegments = urlObject.pathname.split('/');
    // Remove the last segment, which is assumed to be the filename
    pathSegments.pop();
    urlObject.pathname = pathSegments.join('/');
    return urlObject.toString();
  } catch (error) {
    return '';
  }
}

function compareModel(editorInstance: EditorClass) {
  if (editorInstance.isCodeEditor) {
    return editorInstance.editor.addAction({
      id: "compare.model",
      label: `Compare`,
      contextMenuGroupId: "navigation", // atau "custom" sesuai selera
      contextMenuOrder: 1.3,
      run: async () => {
        const { workspace } = useWorkspace();
        const group = workspace.activeGroup!;
        const modModelUri = group.activeTab?.instance.model.uri.toString() || '';

        const { post } = usePrompt();
        const originalUrl = await post({
          placeholder: "Type the original document uri...",
          value: removeFilenameFromUrl(modModelUri)
        })
        group.compareFile(originalUrl, modModelUri!)
      },
    })
  }
}
// function preventOnKeyDownCtrlN(editorInstance: EditorClass) {
//   if (editorInstance.isCodeEditor) {
//     return (editorInstance.editor as MonacoCodeEditor).onKeyDown((e) => {
//       console.log(e);
//       if (e.ctrlKey && e.code === "KeyN") {
//         e.preventDefault(); // penting!
//       }
//     });
//   }
// }

// registerAction('prevent_default.on.key.down.ctrl+n', preventOnKeyDownCtrlN);
registerAction('new.tab', actionNewTabContextMenu);
registerAction('toggle.theme', actionThemeContextMenu);
registerAction('split.tab', actionSplitEditor);
registerAction('compare.model', compareModel);

export function init(this: EditorClass) {
  applyAction.apply(this);

  const namespacePlugin = `detect.language.${this.id}`;
  registerPluginOnDidChangeModelContent(namespacePlugin, () => {
    return detectLanguage(this, (model, lang) => {
      this.changeLanguage(lang as ModelLanguage);
    });
  })
  applyPluginOnDidChangeModelContent.apply(this);

  // top.okd = (this.editor as MonacoCodeEditor).onKeyDown(() => console.log("keydown"));

  // (this.editor as MonacoCodeEditor).onKeyDown((e) => {
  //   if (e.ctrlKey && e.code === "KeyN") {
  //     e.preventDefault(); // penting!
  //   }
  // });

  // this.editor.addAction({
  //   id: "jump-to-root",
  //   label: "Jump to Root Tag",
  // keybindings: [
  //   monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyJ
  // ],
  //   contextMenuGroupId: "navigation",
  //   contextMenuOrder: 1.5,
  //   run(ed) {
  //     ed.setPosition({ lineNumber: 1, column: 1 });
  //     ed.revealLineInCenter(1);
  //   }
  // });

}

export function deInit(this: EditorClass) {
  deApplyAction.apply(this, [null, false]);

  const namespacePlugin = `detect.language.${this.id}`;
  deApplyPluginOnDidChangeModelContent.apply(this, [namespacePlugin, true])
}