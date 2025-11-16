import { reactive, Ref, ref } from "vue";

let isOpen = ref(false);
let input = ref<HTMLElement | null> (null);
let vmodel = ref<string>('');
let placeholder = ref<string>('');

const state = {
  resolve: (arg:string) => {},
  reject: (arg:string) => {}
};


function onSubmit(){
  state.resolve(vmodel.value);
  isOpen.value = false;
}

function onCancel(){
  state.reject(vmodel.value);
  isOpen.value = false;
}

// function post(arg:string | null = null) : Promise<string>{
interface IDefOption {
  placeholder?: string;
  value?: string
}
const defOption = {
  placeholder: "Type something..",
  value: ""
}
function post(option:IDefOption = defOption) : Promise<string>{
  isOpen.value = true;

  const value = option.value || defOption.value
  if(value){
    vmodel.value = value;
  }

  const ph = option.placeholder || defOption.placeholder
  if(ph){
    placeholder.value = ph
  }

  return new Promise((r,j) => {
    state.resolve = r;
    state.reject = j;
  })
}

export function usePrompt(){
  return {
    isOpen,
    vmodel,
    input,
    placeholder,
    post,
    onSubmit,
    onCancel
  }
}
// import { reactive, Ref, ref } from "vue";

// let isOpen = ref(false);
// let input = ref<HTMLElement | null> (null);
// let vmodel = ref<string>('');

// const state = reactive({
//   resolve: (arg:string) => {},
//   reject: (arg:string) => {}
// });

// function post(arg:string | null = null) : Promise<string>{
//   isOpen.value = !isOpen.value;

//   if(arg){
//     vmodel.value = arg;
//   }
//   return new Promise((r,j) => {
//     state.resolve = r;
//     state.reject = j;
//   })
// }

// export function usePrompt(){
//   return {
//     isOpen,
//     vmodel,
//     input,
//     post,
//     state,
//   }
// }