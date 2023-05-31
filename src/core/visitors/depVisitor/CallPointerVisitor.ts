import DepVisitor from "./DepVisitor";
import ModuleEntity from "../../entities/ModuleEntity";
import Configure from "../../utils/Configure";
import FunctionEntity from "../../entities/FunctionEntity";
import MethodEntity from "../../entities/MethodEntity";

class CallPointerVisitor extends DepVisitor {
    depVisitor = new DepVisitor();
    setDep(){
        //1.ArrowFunction，UnnamedFunc 与parent 存在 callPointer dep
        //2.一些地方使用了函数名，需要判断是否为函数,如果为funcName,就是callPointer(未处理)
        for(let entity of this.singleCollect.getEntities()){
            if(entity instanceof ModuleEntity){
                let modId = entity.getId();
                for(let childId of entity.getPtrUnnamed_funcIds()){
                    this.depVisitor.saveRelation(modId, childId, Configure.RELATION_CALLPOINTER, Configure.RELATION_CALLPOINTERED_BY);
                    //console.log(modId + "---" + childId + "----" + Configure.RELATION_CALLPOINTER + "----" + Configure.RELATION_CALLPOINTERED_BY)
                }
            }else if(entity instanceof FunctionEntity || entity instanceof MethodEntity){
                let funcId = entity.getId();
                for(let childId of entity.getUnNamed_FuncId()){
                    this.depVisitor.saveRelation(funcId, childId, Configure.RELATION_CALLPOINTER, Configure.RELATION_CALLPOINTERED_BY);
                    //console.log(funcId + "---" + childId + "----" + Configure.RELATION_CALLPOINTER + "----" + Configure.RELATION_CALLPOINTERED_BY)
                }
            }
        }
       // console.log(this.singleCollect.getEntities())

    }

    isAnUnNamedFunc(name:string){
        if(name !== undefined){
            if(name.includes(".")){
                let arr = name.split(".");
                if(arr[arr.length-1].startsWith("unnamed_function_")){
                    return true;
                }else{
                    return false;
                }
            }
        }
    }
}

export default CallPointerVisitor;