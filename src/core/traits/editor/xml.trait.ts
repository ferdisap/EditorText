import { detectAndSetSchema } from "@/languages/xml/schema";
import { getRootPlugin, parseXsdSchema, registerPlugin } from "xsd-parser";
import { detectAttValueAfterInsertAttName } from "@/languages/xml/attribute";
import { EditorClass, EditorXMLClass } from "@/types/editor";
import { detectErrorProcessor } from "@/languages/detection";

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
  detectAndSetSchema(this as EditorXMLClass);
  detectAttValueAfterInsertAttName(this as EditorXMLClass)
  detectErrorProcessor(this, (xmlText):Record<string, any> => ({schemaUrl: (this as EditorXMLClass).schemaUrl}))
}

export function deInit(this: EditorClass) :void {
  
}
