
const storageNamespace = {
  "theme": "f-ed-theme",
  "navigation": "f-ed-navigation",
}

function getBool(namespace:keyof typeof storageNamespace){
  return Boolean(Number(localStorage.getItem(namespace)));
}

function setBool(namespace:keyof typeof storageNamespace, value:boolean){
  return localStorage.setItem(namespace, value ? "1" : "0");
}
export function useStorage(namespace:keyof typeof storageNamespace){

  function get<T>(type : null | "string" | "bool" | "number" = null) :T{
    return type === "string" ? String(localStorage.getItem(namespace)) as T : (
        type === "number" ? Number(localStorage.getItem(namespace)) as T: (
          type === "bool" ? getBool(namespace) as T: (localStorage.getItem(namespace)) as T
        )
      )
  }

  function set(namespace:keyof typeof storageNamespace, value:any){
    return (typeof value === 'boolean') ? setBool(namespace, value) : localStorage.setItem(namespace, value);
  }

  return {get, set}
}