import { AttributeInfo } from "@/types/xml";
import * as monaco from "monaco-editor";
import { XmlEditorTrait } from "@/types/trait";
import { getCurrentParentElement } from "./element";
import { AttributeDef } from "xsd-parser";
import { matchingAttrInfo } from "@/worker/fn_attribute";
import { useWorker } from "@/composables/useWorker";
import { delay } from "@/util/time";
import { EditorClass, EditorXMLClass, MonacoCodeEditor, MonacoModel, MonacoTextModel } from "@/types/editor";
import { WorkspaceObject } from "@/types/workspace";
import { getLineContentAndCursorIndex } from "@/core/Editor";

// 🧩 Suggestion attribute (nama attribute)
export function suggestAttributeName(workspace: WorkspaceObject) {
  monaco.languages.registerCompletionItemProvider("xml", {
    triggerCharacters: [" "],
    provideCompletionItems: (model, position) => {

      // find activeGroup
      const [activeGroup] = workspace.groups.filter((g) => g.id === workspace.activeGroupId);
      if (!activeGroup) return;
      // find active Tab
      const activeTab = activeGroup.activeTab;
      if (!activeTab) return;
      // get xmlEditor. If no schmea return no suggestion
      const xmlEditor = activeTab!.instance as unknown as XmlEditorTrait;
      if (!xmlEditor.schema) return { suggestions: [] } as monaco.languages.CompletionList;

      const textBefore = model.getValueInRange({
        startLineNumber: position.lineNumber,
        startColumn: 1,
        endLineNumber: position.lineNumber,
        endColumn: position.column,
      });

      const match = textBefore.match(/<(\w+)/);
      if (!match) return { suggestions: [] };

      const elementName = match[1];
      const def =
        xmlEditor.schema[elementName] ||
        xmlEditor.schema[xmlEditor.schema[elementName!]?.typeName!] ||
        {};

      const attributes = def.attributes
        ? Object.values(def.attributes)
        : [];

      const suggestions: monaco.languages.CompletionItem[] = (attributes as AttributeDef[]).map((attr) => ({
        label: attr.name,
        kind: monaco.languages.CompletionItemKind.Field,
        insertText: `${attr.name}="$0"`,
        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
        documentation: `Attribute of <${elementName}>`,
        detail: attr.origin?.startsWith("ref:")
          ? `Inherited from global attribute '${attr.origin.replace("ref:", "")}'`
          : undefined,
      })) as monaco.languages.CompletionItem[];

      return { suggestions } as monaco.languages.CompletionList;
    },
  });
}

// 🧩 Suggestion untuk nilai attribute (value suggestion)
export function suggestAttributeValue(workspace: WorkspaceObject) {
  monaco.languages.registerCompletionItemProvider("xml", {
    triggerCharacters: [" ", '"'],
    provideCompletionItems: (model, position) => {
      // find activeGroup
      const [activeGroup] = workspace.groups.filter((g) => g.id === workspace.activeGroupId);
      if (!activeGroup) return;
      // find active Tab
      const activeTab = activeGroup.activeTab;
      if (!activeTab) return;
      // get xmlEditor. If no schmea return no suggestion
      const xmlEditor = activeTab!.instance as unknown as XmlEditorTrait;

      if (!xmlEditor.schema) return { suggestions: [] } as monaco.languages.CompletionList;
      // const xmlText = model.getValue();
      const textBefore = model.getValueInRange({
        startLineNumber: position.lineNumber,
        startColumn: 1,
        endLineNumber: position.lineNumber,
        endColumn: position.column,
      });

      // Deteksi elemen aktif
      const elementMatch = textBefore.match(/<(\w+)/);
      if (!elementMatch) return { suggestions: [] };
      const elementName = elementMatch[1];

      // Deteksi jika sedang di dalam tanda kutip → tampilkan value suggestion
      const quoteMatch = textBefore.match(/(\w+)="[^"]*$/);
      // const quoteMatch = textBefore.match(/(\w+)=["'][^"']*$/);
      const insideAttr = quoteMatch ? quoteMatch[1] : null;

      const def =
        xmlEditor.schema[elementName] ||
        xmlEditor.schema[xmlEditor.schema[elementName!]?.typeName!] ||
        {};

      // 🎯 Jika sedang di dalam tanda kutip → tampilkan value suggestion
      if (insideAttr && def.attributes?.[insideAttr]) {
        console.log("💡 Value suggestion active for", insideAttr);
        const attrDef = def.attributes[insideAttr];
        let suggestions: monaco.languages.CompletionItem[] = [];

        // Gunakan enum values dari options
        if (attrDef.options?.length) {
          suggestions = attrDef.options.map((opt: string) => ({
            label: opt,
            kind: monaco.languages.CompletionItemKind.Value,
            insertText: opt,
            documentation: `Possible value of "${insideAttr}"`,
          })) as monaco.languages.CompletionItem[];
        }

        // Jika ada default/fixed
        if (attrDef.default)
          suggestions.unshift({
            label: attrDef.default,
            kind: monaco.languages.CompletionItemKind.Value,
            insertText: attrDef.default,
            documentation: `Default value (from schema)`,
            range: new monaco.Range(
              position.lineNumber,
              position.column,
              position.lineNumber,
              position.column
            ),
          });

        if (attrDef.fixed && attrDef.fixed !== attrDef.default)
          suggestions.unshift({
            label: attrDef.fixed,
            kind: monaco.languages.CompletionItemKind.Value,
            insertText: attrDef.fixed,
            documentation: `Fixed value (cannot be changed)`,
            range: new monaco.Range(
              position.lineNumber,
              position.column,
              position.lineNumber,
              position.column
            ),
          });
        return { suggestions };
      }

      // 🧩 Jika tidak di dalam tanda kutip → tampilkan daftar attribute
      if (!def.attributes || Object.keys(def.attributes).length === 0)
        return { suggestions: [] };

      const suggestions = Object.entries(def.attributes).map(
        ([attrName, attrDef]: [string, any]) => {
          const docParts: string[] = [];
          if (attrDef.ref) docParts.push(`Inherited from global attribute "${attrDef.ref}"`);
          if (attrDef.default) docParts.push(`Default: ${attrDef.default}`);
          if (attrDef.fixed) docParts.push(`Fixed: ${attrDef.fixed}`);
          if (attrDef.options?.length)
            docParts.push(`Options: ${attrDef.options.join(", ")}`);

          return {
            label: attrName,
            kind: monaco.languages.CompletionItemKind.Field,
            // ⚡ tidak isi default value, agar user bisa pilih value berikutnya
            insertText: `${attrName}="$0"`,
            insertTextRules:
              monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: {
              value: docParts.join("\n") || `Attribute of <${elementName}>`,
            },
            detail: attrDef.type
              ? `Type: ${attrDef.type}`
              : "Attribute",
          } as monaco.languages.CompletionItem;
        }
      );

      return { suggestions };
    },
  });
}

const { simpleDebounce } = delay()

// 🧩 agar suggestion Attribute Value dropdown muncul otomatis ketika user klik suggestion name, harus ada trigger
export function detectAttValueAfterInsertAttName(xmlEditor: EditorXMLClass) {
  let lastAttrInside: string | null = null;
  const editor = xmlEditor.editor;
  const { postToWorker } = useWorker('xml');
  if(xmlEditor.isCodeEditor){
    return (editor as MonacoCodeEditor).onDidChangeCursorSelection((e) => {
      if (!(xmlEditor.hasOwnProperty('schema'))) return;
      simpleDebounce(async () => {
        const model = (editor as MonacoCodeEditor).getModel();
        if (!model) return;
        const workerResponse = await postToWorker("match-attr-info", getLineContentAndCursorIndex(xmlEditor));
        const attrInfo = workerResponse.result as AttributeInfo;
        if (!attrInfo?.insideValue) return;
  
        // Jika masih di dalam atribut yang sama → abaikan (supaya tidak looping)
        if (lastAttrInside === attrInfo.name) return;
        lastAttrInside = attrInfo.name;
  
        const position = e.selection.getStartPosition();
        const xmlText = model.getValue();
        const offset = model.getOffsetAt(position);
        const parent = getCurrentParentElement(xmlText, offset);
        const def =
          xmlEditor.schema![parent!] ||
          xmlEditor.schema![xmlEditor.schema![parent!]?.typeName!] ||
          undefined;
  
        if (!def?.attributes?.[attrInfo.name]) return;
  
        // console.log("💡 Triggering autosuggest for value of", attrInfo.name);
  
        // 🪄 Trik: sisipkan karakter dummy agar Monaco tahu provider aktif
        (editor as MonacoCodeEditor).executeEdits("dummy", [
          {
            range: new monaco.Range(
              position.lineNumber,
              position.column,
              position.lineNumber,
              position.column
            ),
            text: " ",
          },
        ]);
  
        setTimeout(() => {
          (editor as MonacoCodeEditor).executeEdits("dummy", [
            {
              range: new monaco.Range(
                position.lineNumber,
                position.column,
                position.lineNumber,
                position.column + 1
              ),
              text: "",
            },
          ]);
          editor.trigger("autoSuggest", "editor.action.triggerSuggest", {});
        }, 80);
      }, 300)
    });
  }
}