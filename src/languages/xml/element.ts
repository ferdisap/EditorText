import * as monaco from "monaco-editor";
import { XmlEditorTrait } from "@/types/trait.type";
import { WorkspaceClass } from "@/types/workspace.type";
import { EditorXMLClass, GroupClass } from "@/types/editor.type";

// 🧩 Suggestion element berdasarkan parent langsung
export function suggestElement(workspace: WorkspaceClass) {
  monaco.languages.registerCompletionItemProvider("xml", {
    triggerCharacters: ["<"],
    provideCompletionItems: (model, position) => {
      // find activeGroup
      const [activeGroup] = workspace.groups.filter((g: GroupClass) => g.id === workspace.activeGroupId);
      if (!activeGroup) return;
      // find active Tab
      const activeTab = activeGroup.activeTab;
      if (!activeTab) return;
      // get xmlEditor. If no schmea return no suggestion
      const xmlEditor = activeTab!.instance as EditorXMLClass;
      if (!xmlEditor.schema) return { suggestions: [] } as monaco.languages.CompletionList;

      // const range = getReplaceRange(model, position);
      const xmlText = model.getValue();
      const offset = model.getOffsetAt(position);
      const parent = getCurrentParentElement(xmlText, offset);
      
      console.log("💡 Value suggestion active for", `<${parent || xmlEditor.root}>`);

      let suggestions: monaco.languages.CompletionItem[] = [];
      if (!parent && xmlEditor.root) {
        // Jika di luar elemen apa pun → tampilkan root elements saja
        suggestions = [xmlEditor.root].map((el) => ({
          label: el,
          kind: monaco.languages.CompletionItemKind.Class,
          insertText: `${el}>$0</${el}`,
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: `Root element`,
        })) as monaco.languages.CompletionItem[];
      } else {
        const def =
          xmlEditor.schema[parent!] ||
          xmlEditor.schema[xmlEditor.schema[parent!]?.typeName!] ||
          undefined;
        if (def && def.children?.length) {
          suggestions = def.children.map((child) => ({
            label: child,
            kind: monaco.languages.CompletionItemKind.Property,
            insertText: `${child}>$0</${child}`,
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: `Child of <${parent}>`,
          })) as monaco.languages.CompletionItem[];
        }
      }
      return { suggestions } as monaco.languages.CompletionList;
    },
  });
}

/**
 * Deteksi elemen induk dari posisi cursor di XML
 */
export function getCurrentParentElement(xmlText: string, position: number): string | null {
  const upToCursor = xmlText.substring(0, position);
  const openTags: string[] = Array.from(upToCursor.matchAll(/<(\w+)(?!.*\/>)/g)).map(
    (m) => m[1]
  );
  const closeTags: string[] = Array.from(upToCursor.matchAll(/<\/(\w+)>/g)).map(
    (m) => m[1]
  );

  for (const tag of closeTags) {
    const idx = openTags.lastIndexOf(tag);
    if (idx !== -1) openTags.splice(idx, 1);
  }

  return openTags.length > 0 ? openTags[openTags.length - 1] : null;

}