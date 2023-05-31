class PathUtil {
    /**
     * for a string with /, delete the last substr, return the prefix.
     * @param str "a/b/c"
     * @return   a/b
     */
    static deleteLastStrByPathDelimiter(str:string) {
      let arr = str.replace(/\\/g, '/').split('/');
      let substr = arr[0];
      for ( let i:number = 1; i < arr.length -1; i++) {
         substr += "/";
         substr += arr[i];
      }
        return substr;
      }

/**
 * get last substr, splittin by "/"
 * @param str a/b/c
 * @return    c

   getLastStrByPathDelimiter(str:String) {
      let arr : string[] = str.split("/");
        return arr[arr.length - 1];
   }*/
   static getLastStrByPathDelimiter(str: string) {
    let str1 = str.replace(/\\/g, "/");
    let arr = str1.split("/");
    return arr[arr.length - 1];
   }

/**
 * unify filepath into a unified represenation "/"
 * all path in the code are unified "/"
 * @param path   "a/b/c" or "a\b\c"
 * @return   "a/b/c"
 */
    static unifyPath(path:string) {
     if (path.includes("\\")) {
       let arr : string[] = path.split("\\\\");
        return arr.join("\\");
    }
    return path;
}
    static absolutePath(path:string){
        let str = path.replace(/\\/g, '/').split('/');
        let arr = str.splice(1);
        for ( let i = 0; i < arr.length; i++) {
           if(arr[i].endsWith(".js")){
              let res = arr[i].substring(0,arr[i].indexOf("."));
              arr[i] = res;
              return arr.toString().replace(/,/g,'.');
           }
        }
    }



    // @ts-ignore
    static packagePath(path:string):string{
       let res: string[] ;
       let str = path.split('/');
       for (let i = 0; i < str.length; i++) {
           if (str[str.length-1].endsWith(".js")) {
               res = str.slice(1,str.length-1)
           } else {
               res = str.slice(1,str.length)
           }
           let result =res.toString().replace(/,/g,'.');
           return result;
       }
    }

    static deleteLastStrByDot(str:string){
      let subStr;
      let components = str.split(".");
      subStr = components[0];
      for (let index = 1; index < components.length - 1; index++){
      subStr += ".";
      subStr += components[index];
      }
      return subStr;
    }
}
export default PathUtil
//console.log(PathUtil.getLastStrByPathDelimiter("F:\\test\\test1\\test1.js"))
//console.log(PathUtil.deleteLastStrByDot("test.test1.test2"))
//console.log(PathUtil.deleteLastStrByPathDelimiter("F:\\test\\test1\\test2\\index.js"))
//console.log(PathUtil.getLastStrByPathDelimiter("F:/test/test1/test2"))
// console.log(PathUtil.unifyPath("F:\\test\\test1\\test1.js"))
// console.log(PathUtil.unifyPath("F:test/test1/test1.js"))
