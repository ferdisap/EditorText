import { type WorkspaceClass } from "@/types/workspace.type";
import { suggestAttributeName, suggestAttributeValue } from "./attribute";
import { suggestElement } from "./element";
import { tooltip } from "./tooltip";

/**
 * dijalankan di level workspace
 * @param workspace 
 */
export async function registerCompletionItemProvider(workspace: WorkspaceClass){
  suggestElement(workspace);
  suggestAttributeName(workspace);
  suggestAttributeValue(workspace);
  tooltip(workspace);
}