import * as fs from "fs";
import EntityVisitor from "./EntityVisitor";
//import parser from "@babel/parser";
const parser = require("@babel/parser")
class FileParser{
    private fileFullPath;
    constructor(str:string) {
        this.fileFullPath = str;
    }

    parseOneFile() {
        try {
            if (this.fileFullPath) {
                console.log(this.fileFullPath)
                const content = fs.readFileSync(this.fileFullPath, 'utf-8');
                let ast = parser.parse(content,{plugins:['classProperties','jsx','typescript', 'classPrivateProperties', 'classPrivateMethods','decorators-legacy', 'importAssertions'],allowReturnOutsideFunction:true,errorRecovery:true,sourceType:"module"});
                // console.log(ast)
                // console.log("______________________________")
                // console.log(ast.program.body)
                // console.log("\\\\\\\\\\\\\\\\\\\\\\|")
                // console.log(ast.program.body[0].body)
                let entityVisitor = new EntityVisitor(this.fileFullPath,ast,content);
                entityVisitor.visitAll();
            }
        }catch (err){
            //console.log("there are some errors may occur when parsing this file");
            console.log(err)
            //能否跳过这个错误继续执行？
        }
    }
}
export default FileParser;