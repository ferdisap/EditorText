<script setup lang="ts">
import Workspace from "@/components/Workspace.vue";
import { WSpaceDataProp } from "./core/Workspace";

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

</script>

<template>
  <Workspace :data="data4" />
</template>
