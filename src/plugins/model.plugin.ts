import { type EditorClass, type MonacoModel } from "@/types/editor.type";
import { type IDisposableRecord } from "@/types/plugins.type";
import { IDisposable } from "monaco-editor";
import { isProxy, toRaw } from "vue";

/** key is Editor Class instanced, value is ID */
const WmDisposeAbleEditorOnBeforeCloseRecord = new WeakMap<MonacoModel, () => void>

/** di EXPOR ke index.ts */
export function onBeforeDisposeModel(model: MonacoModel, callback:() => void) {
  const editorInstance = isProxy(model) ? toRaw(model) : model;
  WmDisposeAbleEditorOnBeforeCloseRecord.set(editorInstance, callback)
}

/**  */
export function executeOnBeforeDisposeModel(model: MonacoModel) {
  const editorModel = isProxy(model) ? toRaw(model) : model;
  const disposeableRecords = WmDisposeAbleEditorOnBeforeCloseRecord.get(editorModel);
  if (disposeableRecords) {
    disposeableRecords();
  }
}

