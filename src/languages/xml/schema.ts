import { delay } from "@/util/time";
import { DetectSchemaLocationPayload, MatchingAttrInfoPayload, SchemaUrl, WorkerResponse, useWorker } from "@/composables/useWorker";
import { AttributeInfo } from "@/types/xml";
import { EditorXMLClass, MonacoCodeEditor, MonacoEditor, MonacoTextModel } from "@/types/editor";
import { getLineContentAndCursorIndex } from "@/core/Editor";

export function detectAndSetSchema(xmlEditor: EditorXMLClass) {
  const { postToWorker } = useWorker('xml');
  const { debounce } = delay();
  let lastAttrInside: string | null = null;
  let editor: MonacoEditor;
  if (xmlEditor.isCodeEditor) {
    editor = xmlEditor.editor;
  } else {
    editor = xmlEditor.modifiedEditor;
  }
  const disposable = (editor as MonacoCodeEditor).onDidChangeCursorSelection((e) => {
    debounce(async () => {
      let wkPayload: DetectSchemaLocationPayload | MatchingAttrInfoPayload;
      let wkResponse: WorkerResponse;

      // get schema by all xmlText
      wkPayload = { xmlText: (editor.getModel() as MonacoTextModel)!.getValue() }
      wkResponse = await postToWorker("detect-schema-location", wkPayload);
      let schemaUrl: SchemaUrl | null | undefined = wkResponse.result as SchemaUrl;
      if (schemaUrl && (schemaUrl.endsWith('.xsd')) && (xmlEditor.schemaUrl !== schemaUrl)) {
        xmlEditor.setSchemaByUrl(schemaUrl);
        return;
      }
      else if (xmlEditor.schemaUrl) return;

      // get schema by cursor position
      wkPayload = getLineContentAndCursorIndex(xmlEditor) as MatchingAttrInfoPayload;
      wkResponse = await postToWorker("match-attr-info", wkPayload);
      const attrInfo = wkResponse.result as AttributeInfo;
      if (!attrInfo?.insideValue) return;

      // Jika masih di dalam atribut yang sama → abaikan (supaya tidak looping)
      if (lastAttrInside === attrInfo.name) return;
      lastAttrInside = attrInfo.name;

      if (xmlEditor.schemaUrl != attrInfo.value) {
        const wkResponse = await postToWorker("match-attr-info", wkPayload);
        const attrInfo = wkResponse.result as AttributeInfo;
        if (
          attrInfo
          && (attrInfo.name === 'noNamespaceSchemaLocation' || attrInfo.name === 'schemaLocation')
          && (attrInfo.value && attrInfo.value.toString().endsWith('.xsd'))) {
          xmlEditor.setSchemaByUrl(attrInfo.value as string);
        }
      }
    }, 500)()
  }
  )
  return disposable;

  // menghapus event
  // disposable.dispose()
}