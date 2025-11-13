import { EditorInstance } from "./EditorInstance";
import { XmlEditorTrait } from "@/types/trait";
import { setSchemaByUrl, init as InitXml, validateToSchema, validateWellForm } from "./editor/xml.trait";
import { init as initPlaintext } from "./traits/editor/plaintext.trait"
import { EditorClass } from "@/types/editor";
import { ModelLanguage } from "@/types/model";

function ifLanguageXml(): XmlEditorTrait {
  // const { schemaUrl, root, schema } = setSchemaByUrl(null);
  return {
    setSchemaByUrl
  } as XmlEditorTrait
}

function ifLanguagePlaintext() {
  return {}
}

// value is language
const mapAppliedTraitOnInstance:WeakMap<EditorClass, ModelLanguage> = new WeakMap();

// Fungsi untuk menambahkan trait ke class yang sudah di instance,
export function applyTraitOnInstanced(targetClassInstanced: EditorClass) {
  const language = targetClassInstanced.language;
  if(language && !mapAppliedTraitOnInstance.has(targetClassInstanced)){
    switch (language) {
      case 'xml': Object.assign(targetClassInstanced, ifLanguageXml()); break;
      default: Object.assign(targetClassInstanced, ifLanguagePlaintext()); break;
    }
    mapAppliedTraitOnInstance.set(targetClassInstanced, language);
  }
}
export function removeTraitOnInstanced(targetClassInstanced: EditorClass) {
  const language = targetClassInstanced.language;
  if(language && mapAppliedTraitOnInstance.has(targetClassInstanced)){
    let props: Record<string, any>;
    switch (language) {
      case 'xml': props = ifLanguageXml(); break;
      default: props = ifLanguagePlaintext(); break;
    }
    for (const propName of Object.keys(props)) {
      delete (targetClassInstanced as any)[propName];
    }
    mapAppliedTraitOnInstance.delete(targetClassInstanced);
  }
}

// // fungsi untuk menambah trait pada class yang belum di instance. Bersifat permanent ketika ada instance berkali kali
// export function applyTraitOnClass(targetClass: EditorClass) {
//   const language = targetClass.language;
//   let props: Record<string, any>;
//   switch (language) {
//     case 'xml': props = ifLanguageXml(); break;
//     default: props = ifLanguagePlaintext(); break;
//   }
//   for (const [propName, propValue] of Object.entries(props)) {
//     (targetClass as any).prototype[propName] = propValue;
//   }
// }

// // fungsi untuk menghapus trait pada class yang belum di instance, yang sebelumnya sudah dilakukan applyTraitOnClass
// export function removeTraitOnClass(targetClass: EditorClass) {
//   const language = targetClass.language;
//   let props: Record<string, any>;
//   switch (language) {
//     case 'xml': props = ifLanguageXml(); break;
//     default: props = ifLanguagePlaintext(); break;
//   }
//   for (const propName of Object.keys(props)) {
//     (targetClass as any).prototype[propName] = undefined;
//   }
// }