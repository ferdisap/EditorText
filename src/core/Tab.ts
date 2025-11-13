import { detectLanguage } from "@/languages/detection";
import { EditorClass, TabClass } from "@/types/editor";
import { changeLanguage } from "./traits/editor/general.trait";
import { applyTraitOnInstanced, removeTraitOnInstanced } from "./traits/apply";
import { ModelLanguage } from "@/types/model";

export function Tab(instace: EditorClass): TabClass {
  const _id: string = instace.id;
  let _instance = instace;

  const myTab =  {
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
      // const model = _instance.editor.getModel()!;
      // // console.log(model)
      // const { modelStore } = useModelStore()
      // const { editorsInstancesId } = modelStore.value.mapModelAndEditor(model.id)[0];

      // // jika model ini hanya dipakai di satu editor dispose model dan editor (destroy juga containernya)
      // const isUsedOnlyOneEditor: boolean = editorsInstancesId.length <= 1 && _id === editorsInstancesId[0];

      // if (isUsedOnlyOneEditor) {
      //   model.dispose();

      //   // clearing worker
      //   terminateWorker(model.getLanguageId())
      // }
      // // jika model ini dipakai semua maka cukup hancurkan saja editornya
      // // _instance.destroy();
      // _instance.disposeEditor()
    }
  }

  detectLanguage(myTab, (model, lang) => {
    // changeLanguage(myTab, lang);
    myTab.instance.changeLanguage(lang as ModelLanguage);
    removeTraitOnInstanced(_instance);
    applyTraitOnInstanced(_instance);
    _instance.init();
  });
  return myTab;
}