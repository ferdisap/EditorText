import * as monaco from "monaco-editor";
import { Workspace } from "./core/Workspace";

const workspace = Workspace();
const group1 = workspace.addGroup("Main");

// buat monaco editor
const editor = monaco.editor.create(document.getElementById("container")!, { language: "xml" });

// buka file
workspace.openEditor(group1.id, "file.xml", "<root/>", editor);

// buat split
const group2 = workspace.addGroup("Right View");
const model = workspace.models.getModel(group1.activeTab!.instance.modelId)!;
const editor2 = monaco.editor.create(document.getElementById("container2")!, { model });
workspace.openEditor(group2.id, "file.xml (split)", "", editor2);
