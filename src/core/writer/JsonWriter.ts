import Configure from "../utils/Configure";
import JDepObject from "../formator/fjson/JDepObject";

let fs = require("fs");
class JsonWriter{
    private str = "";
    configure = Configure.getConfigureInstance();
    toJson(depObject:any, fileName:string,fileFullPath:string){
        fileName = fileFullPath+"\\"+fileName;
        //1.能否重新修改内容并重新生成一个对象
        //2.直接修改初始声明类型为Array,而不是Set,中途处理时先用局部Set,再转化为Array保存（缺点：需要改动所有保存信息到集合的地方）
        // for(let i=0;i<depObject.getVariables().length;i++){
        //     //把depObject中值为集合的先转换成数组
        //     if(depObject.getVariables()[i].id == 1){
        //         //把Set转化为Array
        //         //console.log(depObject.getVariables()[i])
        //         //console.log(Array.from(depObject.getVariables()[i].getChildrenIds()))
        //         //对象的值
        //         //console.log(Object.values(depObject.getVariables()[i]))
        //         // let a=[{"a":[1,2,2]}]
        //         //  console.log(JSON.stringify(a))
        //     }
        // }
        this.str = JSON.stringify(depObject,null,"\t");
        //this.str  string|| buffer
        this.writeFileRecursive(fileName,this.str,function(err:any){
            console.log(err)})
    }


    writeFileRecursive(path:string, depObject:Object, callback:any){
        let path1 = (path.substring(0,path.lastIndexOf("\\")));
        let originPath = path1.substring(0,path1.lastIndexOf("\\"))
        if(originPath.endsWith(".js")){
            //说明传入路径为一个js文件
            let jsonFile = path.substring(path.lastIndexOf("\\")+1,path.length);
            let lastPath = path.substring(0, path.lastIndexOf("\\"));
            let lstPath = lastPath.substring(0,lastPath.lastIndexOf("\\"));
            let lstDir = lastPath.substring(lastPath.lastIndexOf("\\")+1,lastPath.length);
            if(lstPath.endsWith(".js")){
                lstPath = lstPath.substring(0,lstPath.lastIndexOf("\\"))
                lstPath = lstPath + "\\" + lstDir;
                fs.mkdir(lstPath, {recursive: true}, (err:any) => {
                    if (err) return callback(err);
                    path = lstPath + "\\" + jsonFile;
                    fs.writeFile(path, this.str, function(err:any){
                        if (err) return callback(err);
                    });
                });
            }
        }else{
            //传入的为目录时
            let lastPath = path.substring(0, path.lastIndexOf("\\"));
            fs.mkdir(lastPath, {recursive: true}, (err:any) => {
                if (err) return callback(err);
                fs.writeFile(path, this.str, function(err:any){
                    if (err) return callback(err);
                });
            });
        }

        //传入的为目录时
        // let lastPath = path.substring(0, path.lastIndexOf("\\"));
        // fs.mkdir(lastPath, {recursive: true}, (err:any) => {
        //     if (err) return callback(err);
        //     fs.writeFile(path, this.str, function(err:any){
        //         if (err) return callback(err);
        //     });
        // });
    }
}
export default JsonWriter;