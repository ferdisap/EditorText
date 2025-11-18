import { useHidden } from "@/composables/navigation/useHidden";
import { isProxy, toRaw } from "vue";

/**
 * ===========================
 *  on toggled
 * ===========================
 */
const WmDisposeAbleOnNavContentToggled = new WeakMap<HTMLElement, Array<() => void>>();

/** di EXPOR ke index.ts */
export function onNavContentToggled(callback:() => void){
  const { navContent } = useHidden();
  if(navContent){
    const el :HTMLElement = (isProxy(navContent) ? toRaw(navContent) : navContent) as unknown as HTMLElement;
    if(!WmDisposeAbleOnNavContentToggled.has(el)) WmDisposeAbleOnNavContentToggled.set(el,[]);
    WmDisposeAbleOnNavContentToggled.get(el)?.push(callback);
  }
}

export function executeOnNavContentToggled(){
  const { navContent } = useHidden();
  const el :HTMLElement = (isProxy(navContent) ? toRaw(navContent) : navContent) as unknown as HTMLElement;
  if(WmDisposeAbleOnNavContentToggled.has(el)){
    const callbacks = WmDisposeAbleOnNavContentToggled.get(el)!;
    for (const callback of callbacks){
      callback();
    }
  }
}


/**
 * ===========================
 *  on resized
 * ===========================
 */
const WmDisposeAbleOnNavContentResized = new WeakMap<HTMLElement, Array<(delta:number) => void>>();

/** di EXPOR ke index.ts */
export function onNavContentResized(callback:(delta:number) => void){
  const { navContent } = useHidden();
  if(navContent){
    const el :HTMLElement = (isProxy(navContent) ? toRaw(navContent) : navContent) as unknown as HTMLElement;
    if(!WmDisposeAbleOnNavContentResized.has(el)) WmDisposeAbleOnNavContentResized.set(el,[]);
    WmDisposeAbleOnNavContentResized.get(el)?.push(callback);
  }
}

export function executeOnNavContentResized(delta:number){
  const { navContent } = useHidden();
  const el :HTMLElement = (isProxy(navContent) ? toRaw(navContent) : navContent) as unknown as HTMLElement;
  if(WmDisposeAbleOnNavContentResized.has(el)){
    const callbacks = WmDisposeAbleOnNavContentResized.get(el)!;
    for (const callback of callbacks){
      callback(delta);
    }
  }
}