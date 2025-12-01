<script setup lang="ts">
import Workspace from "@js-editor/components/Workspace.vue";
import { WSpaceDataProp } from "./core/Workspace";
import { registerAction } from "./plugins/action.plugin";
import { EditorClass } from "./types/editor.type";

const data1 :WSpaceDataProp = {
  "groups": [{
    "editors": [
      {
        "type": "text",
      },
      // {
      //   "type": "text",
      // },
      // {
      //   "type": "text",
      // },
      // {
      //   "type": "text",
      // },
      // {
      //   "type": "text",
      // },
      // {
      //   "type": "text",
      // },
      // {
      //   "type": "text",
      // },
      // {
      //   "type": "text",
      // },
      // {
      //   "type": "text",
      // },
      // {
      //   "type": "text",
      // },
      // {
      //   "type": "text",
      // },
      // {
      //   "type": "text",
      // },
      // {
      //   "type": "text",
      // },
      // {
      //   "type": "text",
      // },
      // {
      //   "type": "text",
      // },
      // {
      //   "type": "text",
      // },
      // {
      //   "type": "text",
      // },
      // {
      //   "type": "text",
      //   "uri" : "http://localhost:5173/test/DMC-BRAKE-AAA-DA1-00-00-00AA-041A-A_003-00_EN-US.XML"
      // },
      // {
      //   "type": "text",
      //   "uri" : "http://localhost:5173/test/DMC-BRAKE-AAA-DA1-00-00-00AA-041A-A_003-00_EN-US.XML"
      // },
      // {
      //   "type": "text",
      //   "uri" : "http://localhost:5173/test/DMC-BRAKE-AAA-DA1-00-00-00AA-041A-A_003-00_EN-US.XML"
      // },
      // {
      //   "type": "text",
      //   "uri" : "http://localhost:5173/test/DMC-BRAKE-AAA-DA1-00-00-00AA-041A-A_003-00_EN-US.XML"
      // },
      // {
      //   "type": "text",
      //   "uri" : "http://localhost:5173/test/DMC-BRAKE-AAA-DA1-00-00-00AA-041A-A_003-00_EN-US.XML"
      // },
      // {
      //   "type": "text",
      //   "uri" : "http://localhost:5173/test/DMC-BRAKE-AAA-DA1-00-00-00AA-041A-A_003-00_EN-US.XML"
      // },
      // {
      //   "type": "text",
      //   "uri" : "http://localhost:5173/test/DMC-BRAKE-AAA-DA1-00-00-00AA-041A-A_003-00_EN-US.XML"
      // },
      // {
      //   "type": "text",
      //   "uri" : "http://localhost:5173/test/DMC-BRAKE-AAA-DA1-00-00-00AA-041A-A_003-00_EN-US.XML"
      // },
      {
        "type": "compare",
        "uri" : "http://localhost:5173/test/purchaseOrder.xml",
        "originalUri": "http://localhost:5173/test/purchaseOrder_mod.xml"
      }
  ]
  }]
}

const data2 :WSpaceDataProp = {
  "groups": [{
    "editors": [{
      "type": "compare",
      "uri" : "http://localhost:5173/test/purchaseOrder.xml",
      "originalUri": "http://localhost:5173/test/purchaseOrder_mod.xml"
    }]
  }]
}

const data3 :WSpaceDataProp = {
  "groups": [{
    "editors": [{
      "type": "text",
    }]
  }]
}

const data4 :WSpaceDataProp = {
  "groups": [{
    "editors": [{
      "type": "text",
      "uri" : "http://localhost:5173/test/DMC-BRAKE-AAA-DA1-00-00-00AA-041A-A_003-00_EN-US.XML"
    }]
  }]
}

registerAction("save.doc", (editorInstance: EditorClass) => {
  editorInstance.editor.addAction({
    "id": "save.doc",
    "contextMenuGroupId": "configuration",
    "contextMenuOrder": 1.5,
    "label": "Save",
    "run": (ed) => {
      const value = ed.getModel()?.getValue();
      console.log(value);
    }
  })
})
registerAction("commit.doc", (editorInstance: EditorClass) => {
  editorInstance.editor.addAction({
    "id": "commit.doc",
    "contextMenuGroupId": "configuration",
    "contextMenuOrder": 1.6,
    "label": "Commit",
    "run": (ed) => {
      const value = ed.getModel()?.getValue();
      console.log(value);
    }
  })
})

</script>

<template>
  <Workspace :data="data4" />
</template>
