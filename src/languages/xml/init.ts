import { WorkspaceObject } from "@/types/workspace";
import { suggestAttributeName, suggestAttributeValue } from "./attribute";
import { suggestElement } from "./element";
import { tooltip } from "./tooltip";

/**
 * dijalankan di level workspace
 * @param workspace 
 */
export async function registerCompletionItemProvider(workspace: WorkspaceObject){
  suggestElement(workspace);
  suggestAttributeName(workspace);
  suggestAttributeValue(workspace);
  tooltip(workspace);
}