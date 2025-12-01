import * as monaco from "monaco-editor";
import { useMarkerPanel } from "@js-editor/composables/useMarkerPanel";
import { useWorker, type ValidatePayload } from "@js-editor/composables/useWorker";
import { MARKER_VALIDATION_NS } from "@js-editor/core/panel/Problem";
import { type EditorClass, type MonacoCodeEditor, type MonacoEditor, type MonacoTextModel, type TabClass } from "@js-editor/types/editor.type";
import { delay } from "@js-editor/util/time";
import { ValidationInfo } from "xml-xsd-validator-browser";

function defPatterns(): Record<string, RegExp[]> {
  return {
    xml: [
      /^<\?xml/i,
      /^<!DOCTYPE\s+xml/i,
      /^<[^>]+>/i, // general xml tag start
    ],
    html: [
      /^<!DOCTYPE\s+html/i,
      /^<html/i,
      /<head>|<body>|<\/html>/i,
    ],
    json: [
      /^\s*[\{\[]\s*("[^"]*"\s*:\s*)?/,
    ],
    javascript: [
      /\b(function|const|let|var|import|export|class|=>)\b/,
      /console\.log/,
      /^\/\/.*|^\/\*.*\*\//,
    ],
    typescript: [
      /\binterface\b|\btype\b|:\s*[A-Z][A-Za-z]+/,
    ],
    css: [
      /^[\.\#][A-Za-z0-9_-]+\s*\{/,
      /@media|@import|:root/,
    ],
    markdown: [
      /^#\s+.+/,
      /^\s*[-*+]\s+.+/,
      /\[.*\]\(.*\)/,
    ],
    yaml: [
      /^[\w-]+:\s+/,
      /^---/,
    ],
    shell: [
      /^#!/,
      /\becho\b|\bcd\b|\bexport\b/,
    ],
    python: [
      /^def\s+\w+\s*\(|^class\s+\w+\s*\(/,
      /^import\s+\w+/,
    ],
    cpp: [
      /^#include/,
      /\bint\s+main\s*\(/,
      /\bstd::/,
    ],
    sql: [
      /\bSELECT\b|\bINSERT\b|\bUPDATE\b|\bDELETE\b|\bFROM\b|\bWHERE\b/i,
    ],
  }
}


/**
 * Detect programming or markup language from text content.
 * Used to automatically switch Monaco Editor's model language.
 *
 * @param text - first few hundred characters of model text
 * @returns detected Monaco language id (e.g. "xml", "json", "html")
 */
function detectLanguageLogic(text: string): string {
  const sample = text.trimStart().slice(0, 500); // ambil potongan awal saja

  // 🧩 Map pattern to monaco language id
  const patterns: Record<string, RegExp[]> = defPatterns();

  // 🔍 Deteksi dengan memeriksa pola
  for (const [lang, tests] of Object.entries(patterns)) {
    if (tests.some((re) => re.test(sample))) {
      return lang;
    }
  }
  // fallback
  return "plaintext";
}

/**
 * Automatically detect and set Monaco model language.
 *
 * @param model Monaco ITextModel
 */
export function detectLanguage(editorInstance: EditorClass, onDetected: (model: MonacoTextModel, lang: string) => void) {

  const { debounce } = delay();
  if (editorInstance.isCodeEditor) {
    const disposable = (editorInstance.editor as MonacoCodeEditor).onDidChangeModelContent(() => {
      // console.log('detectLanguage onDidChangeModelContent')
      debounce(
        () => {
          const model: MonacoTextModel = editorInstance.editor.getModel()! as MonacoTextModel;

          const text = model.getValue().slice(0, 1000);
          const detected = detectLanguageLogic(text);
          const current = model.getLanguageId();

          if (current !== detected) {
            onDetected(model, detected);
          }
        }, 500
      )();
    })
    return disposable;
  }
}

export function detectErrorProcessor(editorInstance: EditorClass, beforeValidate: (textContent: string) => Record<string, any>) {
  const { simpleDebounce } = delay();
  let editor: MonacoCodeEditor;
  if (editorInstance.isCodeEditor) {
    editor = editorInstance.editor as MonacoCodeEditor;
  } else {
    editor = editorInstance.modifiedEditor;
  }
  return editor.onDidChangeModelContent(() => {
    simpleDebounce(
      async () => {
        const model: MonacoTextModel = editorInstance.model as MonacoTextModel;
        const language = model.getLanguageId(); // ← deteksi bahasa aktif        
        if (language === 'xml') {
          const { schemaUrl } = beforeValidate(model.getValue());
          const { postToWorker } = useWorker(language);
          postToWorker("validate", {
            xmlText: model.getValue(),
            schemaUrl
          } as ValidatePayload)
            .then(response => {
              const lang = model.getLanguageId();
              // jika language nya masih sama
              if (lang === language) {
                // const { markerInfoMap } = useMarker(MARKER_VALIDATION_NS);
                // markerInfoMap.value.set(model.id, response.result as ValidationInfo[]);

                const { panel } = useMarkerPanel();
                const model = editorInstance.model;
                const data = response.result as ValidationInfo[]
                panel(MARKER_VALIDATION_NS).map.set(model, { data });

                const imarkerDatas: monaco.editor.IMarkerData[] = data.map((info) => ({
                  message: info.detail.message,
                  severity: monaco.MarkerSeverity["Error"],
                  startColumn: info.detail.col,
                  endColumn: info.detail.col + 1,
                  startLineNumber: info.detail.line,
                  endLineNumber: info.detail.line,
                }) as monaco.editor.IMarkerData)
                monaco.editor.setModelMarkers(model, 'xml-validator', imarkerDatas);
              }
            })
        }
      }, 500
    )
  })
}