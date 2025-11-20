import * as monaco from "monaco-editor";
import { getCurrentParentElement } from "./element";
import { AttributeDef } from "xsd-parser";
import { WorkspaceClass } from "@/types/workspace.type";
import { EditorXMLClass } from "@/types/editor.type";

// 🧩 Tooltip (hover) untuk attribute
export function tooltip(workspace: WorkspaceClass) {
  monaco.languages.registerHoverProvider("xml", {
    provideHover: (model, position) => {

      // find activeGroup
      const [activeGroup] = workspace.groups.filter((g) => g.id === workspace.activeGroupId);
      if (!activeGroup) return;
      // find active Tab
      const activeTab = activeGroup.activeTab;
      if (!activeTab) return;
      // get xmlEditor.
      const xmlEditor = activeTab!.instance as EditorXMLClass;
      
      if(!xmlEditor.schema) return;

      const word = model.getWordAtPosition(position);
      if (!word) return null;

      const xmlText = model.getValue();
      const offset = model.getOffsetAt(position);
      const parent = getCurrentParentElement(xmlText, offset);
      if (!parent) return null;

      const def =
        xmlEditor.schema[parent] ||
        xmlEditor.schema[xmlEditor.schema[parent!]?.typeName!] ||
        undefined;
      const attrDef: AttributeDef | undefined = def?.attributes?.[word.word];
      if (!attrDef) return null;

      let contents = `**${word.word}**`;
      if (attrDef.origin?.startsWith("ref:")) {
        contents += `\n\n*Inherited from global attribute '${attrDef.origin.replace("ref:", "")}'*`;
      }
      if (attrDef.type) contents += `\n\nType: \`${attrDef.type}\``;
      if (attrDef.default) contents += `\nDefault: \`${attrDef.default}\``;
      if (attrDef.fixed) contents += `\nFixed: \`${attrDef.fixed}\``;
      if (attrDef.use) contents += `\nUse: \`${attrDef.use}\``;
      if (attrDef.options?.length)
        contents += `\nOptions: ${attrDef.options.map((o) => `\`${o}\``).join(", ")}`;

      return {
        contents: [{ value: contents }],
      };
    },
  });
}