export function hasMethod<T extends object>(
  obj: T,
  methodName: string
): obj is T & Record<typeof methodName, Function> {
  return typeof (obj as any)[methodName] === "function";
}

// contoh
// const user = {
//   sayHello() {
//     console.log("Hi!");
//   },
// };

// if (hasMethod(user, "sayHello")) {
//   user.sayHello(); // ✅ TypeScript tahu method ini ada
// }
