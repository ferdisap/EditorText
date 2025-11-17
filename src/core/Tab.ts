import { EditorClass, MonacoDiffEditor, MonacoTextModel, TabClass } from "@/types/editor";
import { useModelStore } from "@/composables/useModelstore";
import { terminateWorker } from "@/composables/useWorker";
import { executeOnBeforeCloseEditor } from "@/plugins/editor.plugin";

export function Tab(instace: EditorClass): TabClass {
  const _id: string = instace.id;
  let _instance = instace;

  return {
    get id() {
      return _id;
    },
    get instance() {
      return _instance;
    },
    get name() {
      return _instance.name;
    },
    close() {
      const { modelStore } = useModelStore()      
      if(_instance.isCodeEditor){
        executeOnBeforeCloseEditor(this.instance);
        this.instance.deInit();
        const model = _instance.editor.getModel()!;
        const { editorsInstancesId } = modelStore.mapModelAndEditor((model as MonacoTextModel).id, [_instance.id])[0];
        // jika model ini hanya dipakai di satu editor maka dispose model dan editor (destroy juga containernya)
        const isUsedOnlyOneEditor: boolean = editorsInstancesId.length <= 1 && _id === editorsInstancesId[0];
        if (isUsedOnlyOneEditor) {
          // clearing worker
          terminateWorker((model as MonacoTextModel).getLanguageId());
          // dispose model and editor and domNode div.monaco-editor
          _instance.destroy();
        } else {
          // dispose editor saja karena model masih digunakan
          _instance.disposeEditor();
        }
      }
      else {
        executeOnBeforeCloseEditor(this.instance);
        this.instance.deInit();
        const container = (_instance.editor as MonacoDiffEditor).getContainerDomNode();
        // disposing original model
        const oriEditor = (_instance.editor as MonacoDiffEditor).getOriginalEditor();
        const oriModel = oriEditor.getModel()!;
        let map = modelStore.mapModelAndEditor(oriModel.id, null)[0];
        let editorsInstancesId = map.editorsInstancesId;
        const isOriModelUsedOnlyOneEditor: boolean = editorsInstancesId.length <= 1;
        if(isOriModelUsedOnlyOneEditor){
          oriModel.dispose();
        }
        // disposing modified model
        const modEditor = (_instance.editor as MonacoDiffEditor).getModifiedEditor();
        const modModel = modEditor.getModel()!;
        map = modelStore.mapModelAndEditor(modModel.id, null)[0];
        editorsInstancesId = map.editorsInstancesId;
        const isModModelUsedOnlyOneEditor: boolean = editorsInstancesId.length <= 1;
        if(isModModelUsedOnlyOneEditor){
          modModel.dispose()
        }

        (_instance.editor as MonacoDiffEditor).dispose();
        container.remove();
      }
    }
  }
}