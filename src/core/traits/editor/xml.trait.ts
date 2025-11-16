import { detectAndSetSchema } from "@/languages/xml/schema";
import { getRootPlugin, parseXsdSchema, registerPlugin } from "xsd-parser";
import { detectAttValueAfterInsertAttName } from "@/languages/xml/attribute";
import { EditorClass, EditorXMLClass } from "@/types/editor";
import { detectErrorProcessor } from "@/languages/detection";
import { applyPluginOnDidChangeCursorSelection, registerPluginOnDidChangeCursorSelection } from "@/plugins/onDidChangeCursorSelection.plugin";

// Then access its members like xmllint.validate()

export function setSchemaByUrl(this: EditorXMLClass, url: string): void {
  let root: string = '';
  loadSchemaFromUrl(url)
    .then(schemaText => {
      if (schemaText) {
        registerPlugin(getRootPlugin((r) => (root = r)));
        parseXsdSchema(schemaText)
          .then(schemaData => {
            ;
            this.schema = schemaData;
            this.schemaUrl = url;
            this.root = root;
          });
      }
    })
}

/**
 * Memuat schema dari URL, lalu mengembalikan teks XSD
 */
export async function loadSchemaFromUrl(url: string): Promise<string> {
  return fetch(url).then((response: Response) => response.text());
}

export function init(this: EditorClass): void {

  const namespacePlugin_detectAndSetSchema = `detect.and.set.schema.${this.id}`;
  registerPluginOnDidChangeCursorSelection(namespacePlugin_detectAndSetSchema, () => {
    return detectAndSetSchema(this as EditorXMLClass);
  });

  const namespacePlugin_detectAttValueAfterInsertAttName = `detect.attvalue.after.insert.attsname.${this.id}`;
  registerPluginOnDidChangeCursorSelection(namespacePlugin_detectAttValueAfterInsertAttName, () => {
    return detectAttValueAfterInsertAttName(this as EditorXMLClass);
  });

  const namespacePlugin_detectErrorProcessor = `detect.error.${this.id}`;
  registerPluginOnDidChangeCursorSelection(namespacePlugin_detectErrorProcessor, () => {
    return detectErrorProcessor(this, (xmlText):Record<string, any> => ({schemaUrl: (this as EditorXMLClass).schemaUrl}));
  });

  applyPluginOnDidChangeCursorSelection.apply(this);
}

export function deInit(this: EditorClass) :void {
  
}
