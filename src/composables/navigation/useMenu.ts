import { ref, Ref } from "vue";

export interface MenuItem {
  /** unique menu name */
  id:string,
  /** label for tooltip */
  label: string,
  /** codicon icon */
  icon?:string,
  action?: (e:PointerEvent) => void,
  disabled?:boolean,
}

export interface MenuItemNested extends MenuItem {
  children?: MenuItemNested[]
}

type Position = {x:number, y:number};

const TopMenus :Ref<MenuItem[]> = ref([
  { id: "explorer", label: "Explorer", icon: "codicon codicon-files" },
  { id: "search", label: "Search", icon: "codicon codicon-search" },
]);

const BottomMenus :Ref<MenuItem[]> = ref([]);

const menuMap :Map<string, Ref<MenuItemNested[]>> = new Map();
menuMap.set("nav.menu.top", TopMenus);
menuMap.set("nav.menu.bottom", BottomMenus);
menuMap.set("ctx.menu", ref([]));

const visibleMap :Map<string, Ref<boolean>> = new Map();
visibleMap.set("nav.menu.top", ref(true));
visibleMap.set("nav.menu.bottom", ref(true));
visibleMap.set("ctx.menu", ref(false));

const positionMap :Map<string, Ref<Position>> = new Map();
positionMap.set("ctx.menu", ref({ x: 0, y: 0 }));

export function useMenu(namespace: string){
  if(!(menuMap.has(namespace as string))){
    menuMap.set(namespace, ref([]));
  }
  const MenuList :Ref<MenuItemNested[]> = menuMap.get(namespace)!;

  if(!(visibleMap.has(namespace as string))){
    visibleMap.set(namespace, ref(false));
  }
  const visible :Ref<boolean> = visibleMap.get(namespace)!;

  return {
    MenuList, visible
  }
}

export function useMenuPosition(namespace:string){
  if(!(positionMap.has(namespace as string))){
    positionMap.set(namespace, ref({x:0, y:0}));
  }
  const position = positionMap.get(namespace)!;
  return {
    position,
    set: (pos: Position) => {
      if(position) position.value = pos;
    }
  }
}

export function registerMenuPosition(namespace:string, position:Position){
  positionMap.set(namespace, ref(position));
}

export function searchMenuItemNested(namespace:string, list:MenuItemNested[]) : MenuItemNested | undefined{
  let item = list.find(item => item.id === namespace);
  if(!item){
    for(const i of list){
      if(i.children){
        item = searchMenuItemNested(namespace, i.children);
        if(item){
          break;
        }
      }
    }
  }
  return item;
}

// contoh nested
// const menuItems: MenuItemNested[] = ([
//     // label = label, action = id, icon = icon
//     { label: 'Login', id: 'account.login', "action": () => {
//       console.log('login');
//     } },
//     {
//         id: 'open.with',
//         label: 'Open With',
//         icon: 'codicon-chevron-right',
//         children: [
//             { label: 'JSON Viewer', id: 'openJson' },
//             { label: 'XML Viewer', id: 'openXml' },
//             {
//                 id: 'more.menu',
//                 label: 'More...',
//                 children: [{ label: 'Hex Editor', id: 'openHex' }],
//             },
//         ],
//     },
//     { label: 'Rename', id: 'rename', icon: 'codicon-edit' },
//     { label: 'Delete', id: 'delete', disabled: true },
// ]);
// let CMenu = useMenu('ctx.menu');
// const CMenuPosition = useMenuPosition('ctx.menu');

// CMenu.MenuList.value.push(...menuItems);