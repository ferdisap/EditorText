export interface TreeNode {
  name: string;
  type: "file" | "dir";
  path: string;
  children?: TreeNode[];
  expanded?: boolean;
}

export interface TreeRoot extends TreeNode {
  uri: string;
  children: TreeNode[];
  expanded?: boolean;
}

export type TreeFlat = [path: string, type: TreeNode["type"]];
