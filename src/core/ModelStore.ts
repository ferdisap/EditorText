import * as monaco from "monaco-editor";
import type { ModelStoreClass } from "@/types/model";

export function ModelStore(): ModelStoreClass {
  const _models = <Map<string, monaco.editor.ITextModel>>(new Map());

  // key:modelId value:EditorInstanceType.id
  const _modelAndEditorRelation = <Map<string, string[]>>(new Map());

  return {
    get models() {
      return Array.from(_models.values());
    },
    /**
     * @param uri 
     * @returns model id
     */
    hasUriUsed(uri: string): string | undefined {
      return Array.from(_models.values()).filter(model => model.uri.toString() === uri).map(model => model.id)[0];
    },
    /**
     * 🧩 Buat model baru dan kembalikan ID-nya
     */
    createModel(value: string = '', language: string = 'plaintext', uri: string | null = null): string {
      // const uri = monaco.Uri.parse("http://localhost:5173/test/purchaseOrder.xml");
      let model: monaco.editor.ITextModel;
      let modelId: string | undefined;
      if (!uri) {
        model = monaco.editor.createModel(value, language);
      }
      // check apakah ada model yang sama dengan uri ini
      else if (modelId = this.hasUriUsed(uri)) {
        return modelId
      }
      else {
        model = monaco.editor.createModel(value, language, monaco.Uri.parse(uri));
      }
      _models.set(model.id, model);
      return model.id;
    },
    /**
     * Get and set all editor id related to the model.
     * @param modelId monaco.language.model.id
     * @param editorId EditorInstanceType.id
     * @returns 
     */
    mapModelAndEditor(modelId: string | null = null, editorIds: string[] | null = null){
      if (modelId && editorIds) {
        let editorInstanceIds: string[] = [];
        // jika tidak ada di map maka buat baru
        if (!(_modelAndEditorRelation.has(modelId))) {
          editorInstanceIds.push(...editorIds);
        } else {
          editorInstanceIds.push(..._modelAndEditorRelation.get(modelId)!);
        }
        editorInstanceIds = Array.from(new Set(editorInstanceIds));
        _modelAndEditorRelation.set(modelId, editorInstanceIds);
        return [{
          id: modelId,
          editorsInstancesId: editorInstanceIds
        }]
      }
      else {
        // if just modelId params only, then it will returns array single item only for modelId
        return Array.from(_models.keys())
          .filter(mId => modelId ? mId === modelId : Boolean(mId))
          .map(mId => {
            return {
              id: mId,
              editorsInstancesId: _modelAndEditorRelation.get(mId) || []
            }
          })
          .flat();
      }
    },
    /**
     * 🔍 Ambil model berdasarkan ID
     */
    getModel(idOrUri: string): monaco.editor.ITextModel | undefined {
      return _models.get(idOrUri) ?? Array.from(_models.values()).filter(model => model.uri.toString() === idOrUri)[0];
    },

    /**
     * 🗑️ Dispose model berdasarkan ID
     */
    disposeModel(id: string) {
      const model = _models.get(id);
      if (model) {
        model.dispose();
        _models.delete(id);
      }
    },

    /**
     * 🧹 Dispose semua model
     */
    clear() {
      for (const model of _models.values()) {
        model.dispose();
      }
      _models.clear();
    }
  }
}