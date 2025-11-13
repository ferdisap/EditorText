/**
 * @returns 
 */
export function delay() {
  let timer = 0;
  function debounce(fn: Function, ms: number) {
    clearTimeout(timer)
    return (...args: any[]) => {
      return timer = setTimeout(() => fn(...args), ms || 0);
    };
  }
  function simpleDebounce(fn:Function, ms:number) {
    clearTimeout(timer);
    return timer = setTimeout(() => fn(), ms);
  }
  return { debounce, simpleDebounce };
}