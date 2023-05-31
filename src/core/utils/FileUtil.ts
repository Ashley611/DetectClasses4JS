const fs = require('fs');
const path = require('path');
let filePathList = new Set();
function readFileList(dir:string) {
    let stat = fs.statSync(dir);
    if(stat.isDirectory()){
        const files = fs.readdirSync(dir);
        files.forEach((item:string, index:number) => {
            var fullPath = path.join(dir, item);
            //var filePath = path.resolve(fullPath)
            const stat = fs.statSync(fullPath);
            if (stat.isDirectory()) {
                readFileList(path.join(dir, item)); //递归读取文件
            } else {
                if(fullPath.endsWith(".js")){
                    filePathList.add(fullPath);
                }

            }
        });
    }else if(stat.isFile()){
        filePathList.add(dir);
    }
    // const files = fs.readdirSync(dir);
    // files.forEach((item:string, index:number) => {
    //     var fullPath = path.join(dir, item);
    //     //var filePath = path.resolve(fullPath)
    //     const stat = fs.statSync(fullPath);
    //     if (stat.isDirectory()) {
    //         console.log("是个目录文件")
    //         readFileList(path.join(dir, item)); //递归读取文件
    //     } else {
    //         console.log("进到这里来")
    //         if(fullPath.endsWith(".js")){
    //             filePathList.add(fullPath);
    //         }
    //
    //     }
    // });
    return filePathList;
}
export {filePathList,readFileList}
//var files = readFileList('C:\\Users\\Ashley\\WebstormProjects\\JSExtractor1');
// var files = readFileList('F:\\test');
// console.log(files);