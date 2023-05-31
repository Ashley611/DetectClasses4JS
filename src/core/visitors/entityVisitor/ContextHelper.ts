import ClassEntity from "../../entities/ClassEntity";
import FunctionEntity from "../../entities/FunctionEntity";

class ContextHelper{

    isATopLevel(path:any){
        if(path.parent){
            if(path.parent.type == "Program" || path.parent.type == "ExportNamedDeclaration"
                || path.parent.type == "ExportDefaultDeclaration"){
                //let a=** || export let a=** || a.b = **
                return true;
            }else{
                return false;
            }
        }
    }

    isModify(operator:string){
        if(operator){
            if(operator == "+=" || operator == "-=" || operator == "*=" || operator == "/="
                || operator == "++" || operator == "--" || operator == "**=" || operator == "%="
                || operator == "&=" || operator == "|=" || operator == "^="){
                return true;
            }else{
                return false;
            }
        }else{
            return false;
        }
    }

    isDefaultExport(path:any){
        if(path.parent){
            if(path.parent.type == "ExportNamedDeclaration"){
                return false;
            }else if(path.parent.type == "ExportDefaultDeclaration"){
                return true;
            }else if(path.parent.type == "Program"){
                return false;
            }
        }else{
            return false;
        }
    }

    isDefineExport(path:any){
        if(path.parent){
            if(path.parent.type == "ExportNamedDeclaration"){
                return true;
            }else if(path.parent.type == "ExportDefaultDeclaration"){
                return false;
            }else if(path.parent.type == "Program"){
                return false;
            }
        }else{
            return false;
        }
    }
}
export default ContextHelper;