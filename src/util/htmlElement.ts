export function observeSize(element:HTMLElement, listener: (callback:ResizeObserverEntry[]) => void) : ResizeObserver{
  const ro = new ResizeObserver((cb) => listener(cb))
  ro.observe(element);
  return ro;
}