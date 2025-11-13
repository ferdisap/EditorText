// Get a random integer between 1 and 6
// let diceRoll = getRandomInt(1, 6);
// console.log(diceRoll);
export function randInt(min:number, max:number) :number {
  min = Math.ceil(min); // Ensure min is an integer
  max = Math.floor(max); // Ensure max is an integer
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function isNumberInRange(no:number, min:number, max:number) :boolean {
  return no >= min && no <= max;
}