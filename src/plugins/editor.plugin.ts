import { EditorClass } from "@/types/editor.type";
import { IDisposableRecord } from "@/types/plugins.type";
import { IDisposable } from "monaco-editor";
import { isProxy, toRaw } from "vue";

/** key is Editor Class instanced, value is ID */
const WmDisposeAbleEditorOnBeforeCloseRecord = new WeakMap<EditorClass, () => void>

/** untuk close editor, cek di Tab.ts, bukan dispose / destroy editor */
/** di EXPOR ke index.ts */
export function onBeforeCloseEditor(editorInstance: EditorClass, callback:() => void) {
  const edInst = isProxy(editorInstance) ? toRaw(editorInstance) : editorInstance;
  WmDisposeAbleEditorOnBeforeCloseRecord.set(edInst, callback)
}

export function executeOnBeforeCloseEditor(editorInstance: EditorClass) {
  const edInst = isProxy(editorInstance) ? toRaw(editorInstance) : editorInstance;
  const disposeableRecords = WmDisposeAbleEditorOnBeforeCloseRecord.get(edInst);
  if (disposeableRecords) {
    disposeableRecords();
  }
}

