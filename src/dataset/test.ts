// class A{
//
//   public CalculateEnd(editor: any, vim, start: any) {
//     if (this.CharacterCode === null) {
//       if (vim.LastFindCharacterMotion === null) {
//         return null;
//       }
//     } else {
//       // save direction for ; ,
//       vim.LastFindCharacterMotion = this;
//     }
//   }
// }


// type TwoNumberFunction = (a, b: number) => void;
// const foo: TwoNumberFunction = (a, b) => {
//   /* do something */
// };



// @ts-ignore
function foo(a: number, b: number) {
  return a + addOne(b);
}

function addOne(a) {
  return a + 1;
}