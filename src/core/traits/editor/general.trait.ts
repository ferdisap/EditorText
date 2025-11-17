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
import { DetailResult, MARKER_DETAIL_NS } from "@/core/panel/Detail";
import { useMarkerPanel } from "@/composables/useMarkerPanel";


function actionThemeContextMenu(editorInstance: EditorClass) {
  const { toggleTheme } = useTheme();
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

export function detectDetailModel(editorInstance: EditorClass) {
  const uri = editorInstance.model.uri.toString();
  const lang = editorInstance.language;
  const detailResult: DetailResult = {
    uri, language: lang
  }
  setTimeout(() => {
    const { panel } = useMarkerPanel();
    panel(MARKER_DETAIL_NS).map.set(editorInstance.model, { data: detailResult });
  },1000)
}

export function init(this: EditorClass) {
  detectDetailModel(this);

  applyAction.apply(this);

  const namespacePluginDetectLang = `detect.language.${this.id}`;
  registerPluginOnDidChangeModelContent(namespacePluginDetectLang, () => {
    return detectLanguage(this, (model, lang) => {
      this.changeLanguage(lang as ModelLanguage);
    });
  })

  const namespacePluginDetectDetail = `detect.detail.${this.id}`;
  registerPluginOnDidChangeModelContent(namespacePluginDetectDetail, () => {
    return detectDetailModel(this);
  })

  applyPluginOnDidChangeModelContent.apply(this);
}

export function deInit(this: EditorClass) {
  deApplyAction.apply(this, [null, false]);

  const namespacePluginDetectLang = `detect.language.${this.id}`;
  deApplyPluginOnDidChangeModelContent.apply(this, [namespacePluginDetectLang, true])
}