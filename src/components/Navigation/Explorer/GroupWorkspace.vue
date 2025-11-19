<script setup lang="ts">
import { usePrompt } from "@/composables/usePrompt";
import { useWorkspace } from "@/composables/useWorkspace";
import { computed, nextTick, onBeforeUnmount, ref } from "vue";

type tabData = {
  id: string;
  name: string;
  uri: string;
};
type groupsData = {
  id: string;
  name: string;
  expanded: boolean;
  tabs: tabData[];
  activeTabId: string;
};

const { workspace } = useWorkspace();
const isOpenContent = ref(false);
const groups = computed(() => ref(setGroups()));

const expandMap = new Map<string, boolean>();

function setGroups() {
  return workspace.groups.map((group) => {
    return {
      id: group.id,
      name: group.name,
      expanded: expandMap.get(group.id) || false,
      activeTabId: group.activeTabId,
      tabs: group.tabs.map((tab) => {
        return {
          id: tab.id,
          name: tab.instance.name,
          uri: tab.instance.model.uri.toString(),
        } as tabData;
      }),
    } as groupsData;
  });
}

function expandGroup(group: groupsData) {
  group.expanded = !group.expanded;
  expandMap.set(group.id, group.expanded);
}

function toggleContent() {
  isOpenContent.value = !isOpenContent.value;
  console.log(isOpenContent.value);
}

function openTab(groupId: string, tab: tabData) {
  const group = workspace.groups.find((group) => group.id === groupId)!;
  group.setActiveTab(tab.id);
}

function closeAllGroup() {
  for (const group of workspace.groups) {
    workspace.closeGroup(group.id);
  }
}

function addGroup() {
  const group = workspace.addGroup();
  nextTick(() => group.newFile());
}

function closeAllFiles(groupId:string){
  workspace.closeGroup(groupId);
}

async function newFile(groupId:string){
  const group = workspace.groups.find(gr => gr.id === groupId)!;

  const { post } = usePrompt();
  const uri = await post({
    placeholder: "Insert the required uri if exist.",
  })
  group.newFile('','',uri);
}

onBeforeUnmount(() => {
  expandMap.clear();
});
</script>
<template>
  <div class="ws-tree">
    <div class="nav-content-ident ws-list-hovered-bg-main" @click.stop="toggleContent">
      <i :class="['codicon', isOpenContent ? 'codicon-chevron-down' : 'codicon-chevron-right']"></i>
      <div class="w-full flex justify-between">
        <span class="tab-name font-bold">GROUPS</span>
        <div class="tab-action">
          <button class="tab-close mr-2" title="Add" @click.stop="addGroup">
            <i class="codicon codicon-add ws-icon-sm" />
          </button>
          <button
            class="tab-close mr-2"
            title="Close"
            @click.stop="closeAllGroup"
          >
            <i class="codicon codicon-close ws-icon-sm" />
          </button>
        </div>
      </div>
    </div>
    <!-- Group number -->
    <ul class="tree-node-child" v-show="isOpenContent">
      <li v-for="group in groups.value" :key="group.id">
        <div class="node-dir ws-list-hovered-bg-main flex justify-between" @click="expandGroup(group)">
          <div class="flex item-center">
            <i class="codicon" :class="group.expanded ? 'codicon-chevron-right' : 'codicon-chevron-down'"></i>
            <span class="tab-name ml-1" @dblclick.stop="expandGroup(group)">{{ group.name }}</span>
          </div>
          <div class="tab-action">
            <button class="tab-close mr-2" title="New file" @click.stop="newFile(group.id)">
              <i class="codicon codicon-add ws-icon-sm" />
            </button>
            <button
              class="tab-close mr-2"
              title="Close files"
              @click.stop="closeAllFiles(group.id)"
            >
              <i class="codicon codicon-close ws-icon-sm" />
            </button>
          </div>
        </div>
        <!-- Tab number -->
        <ul v-if="group.expanded" class="ml-4">
          <li
            v-for="tab in group.tabs"
            :key="tab.id"
            :class="[
              'tree-node-child ws-list-hovered-bg-main',
              group.activeTabId === tab.id ? 'active' : '',
            ]"
          >
          <div class="node-files">
            <i class="codicon codicon-file" />
            <span @dblclick.stop="openTab(group.id, tab)">{{ tab.name }}</span>
          </div>
          </li>
        </ul>
      </li>
    </ul>
  </div>
</template>
