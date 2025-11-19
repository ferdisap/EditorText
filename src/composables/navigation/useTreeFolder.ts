import { onFetchRootTree } from "@/plugins/tree.plugin";
import { TreeFlat, TreeNode, TreeRoot } from "@/types/tree";
import { getFilenameFromUri } from "@/util/string";
import { ref } from "vue";

const dummyTreeRootFlat: TreeFlat[] = [
  ["src/index.ts", "file"],
  ["src/utils/helper.ts", "file"],
  ["src/components", "dir"],
  ["abc", "dir"],
  ["abc/tes.xml", "file"],
  ["abc/te2.xml", "file"],
  ["def", "dir"],
  ["def/tes.xml", "file"],
  ["def/te2.xml", "file"],
];

const dummyTreeRoot: TreeRoot = {
  name: "WORKSPACE DUMMY",
  uri: "inmemory://fufufafa.com/files/1",
  path: "",
  type: "dir",
  children: [
    {
      name: "abc",
      path: "abc/",
      type: "dir",
      children: [
        {
          name: "tes.xml",
          path: "abc/tes.xml",
          type: "file",
        },
        {
          name: "tes2.xml",
          path: "abc/tes2.xml",
          type: "file",
        },
      ],
    },
    {
      name: "def",
      path: "def/",
      type: "dir",
      children: [
        {
          name: "tes.xml",
          path: "def/tes.xml",
          type: "file",
        },
        {
          name: "tes2.xml",
          path: "def/tes2.xml",
          type: "file",
        },
      ],
    },
    {
      name: "main.ts",
      path: "./main.ts",
      type: "file",
    },
  ],
};

const treeRoot = ref<TreeRoot[]>([]);

top.treeRoot = treeRoot;

function findOrCreateChild(
  list: TreeNode[],
  name: string,
  path: string
): TreeNode {
  let found = list.find((c) => c.name === name);
  if (!found) {
    found = {
      name,
      path,
      type: "dir",
      children: [],
      expanded: false,
    };
    list.push(found);
  }
  return found;
}

function castToTree(entries: TreeFlat[]): TreeNode[] {
  const root: TreeNode[] = [];

  for (const [fullPath, type] of entries) {
    const parts = fullPath.split("/");
    let currentList = root;
    let currentNode: TreeNode | null = null;
    let currentPath = "";

    parts.forEach((part, i) => {
      currentPath = i === 0 ? part : currentPath + "/" + part;
      currentNode = findOrCreateChild(currentList, part, currentPath);

      // next level
      if (!currentNode.children) currentNode.children = [];
      currentList = currentNode.children;
    });

    if (currentNode) {
      (currentNode as TreeNode).type = type;
      if (type === "file") {
        delete (currentNode as TreeNode).children;
      }
    }
  }

  return root;
}

async function fetching(url: string, opt?: RequestInit): Promise<TreeFlat[]> {
  if (url.includes("inmemory")) {
    return Promise.resolve(dummyTreeRootFlat);
  } else {
    return fetch(url, opt).then((r) => r.json());
  }
}

function expand(node: TreeNode | TreeRoot, rootName: string) {
  if (node.type === "dir" && node.children?.length === 0) {
    const onFetch = onFetchRootTree(rootName);
    let ft: Promise<TreeFlat[]>;
    if (onFetch) {
      const option = onFetch(node);
      if (typeof option === "string") {
        ft = fetching(option);
      } else {
        const url = option.url;
        ft = fetching(url, option);
      }
      ft.then((treesFlat) => {
        node.children = castToTree(treesFlat);
        node.expanded = !node.expanded;
      });
    }
  }
}

function createRoot(name: string, uri: string) {
  let folder: TreeRoot | undefined = treeRoot.value.find(
    (root) => root.name === name
  );
  if (!folder) {
    folder = {
      name,
      uri,
      type: "dir",
      path: "",
      children: [],
    };
    treeRoot.value.push(folder);
  }
  expand(folder, folder.name);
}

export function useTreeFolder() {
  return {
    treeRoot,
    createRoot,
    expand,
  };
}
