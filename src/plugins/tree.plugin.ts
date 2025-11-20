import { useTreeFolder } from "@/composables/navigation/useTreeFolder";
import { TreeNode, TreeRoot } from "@/types/tree.type";


interface FetchOption extends RequestInit {
  url: string
}

const map :Map<string, (node:TreeNode) => FetchOption | string> = new Map();

/**
 * register callback when onFetch children
 * @param name 
 * @param uri 
 * @param onFetch function returned FetchOption or uri 
 * @returns 
 */
export function registerOnFetchTree<T>(name:string, onFetch: (node:TreeNode) => FetchOption | string) :void{
  if(!map.has(name)){
    map.set(name, onFetch);
  }
  return;
}

export function onFetchRootTree(name:string){
  return map.get(name);
}