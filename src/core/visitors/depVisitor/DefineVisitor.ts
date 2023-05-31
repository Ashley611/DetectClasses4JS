import DepVisitor from "./DepVisitor";
import ModuleEntity from "../../entities/ModuleEntity";
import Configure from "../../utils/Configure";
import FunctionEntity from "../../entities/FunctionEntity";
import ClassEntity from "../../entities/ClassEntity";
import VarEntity from "../../entities/VarEntity";
import MethodEntity from "../../entities/MethodEntity";
import PropertyEntity from "../../entities/PropertyEntity";

class DefineVisitor extends DepVisitor {
    depVisitor = new DepVisitor();
//module.exports中的function...在js文件中define
    setDep(){
        let childId:any;
        for(let entity of this.singleCollect.getEntities()){
            if(entity instanceof ModuleEntity){
                for(childId of entity.getChildrenIds()){
                    if(entity.getDefineExportId2Str().has(childId)){
                        continue;
                    }
                    //检查孩子节点中的变量是否为import语句中生成的，如果已经处理为导入的，这里就不是define
                    if(Array.from(this.singleCollect.getEntities())[childId] instanceof VarEntity){
                        let flag = this.isImport(childId,entity);
                        if(flag == true){
                            //是导入变量,是import不是define
                            continue;
                        }
                    }
                    this.depVisitor.saveRelation(entity.getId(), childId, Configure.RELATION_DEFINE, Configure.RELATION_DEFINED_BY);
                    //console.log(entity.getId()+"---"+childId+"----"+Configure.RELATION_DEFINE+"----"+Configure.RELATION_DEFINED_BY)
                }
            }
            if(entity instanceof FunctionEntity){
                for(childId of entity.getChildrenIds()){
                    this.depVisitor.saveRelation(entity.getId(), childId, Configure.RELATION_DEFINE, Configure.RELATION_DEFINED_BY);
                    //console.log(entity.getId() + "---" + childId + "----" + Configure.RELATION_DEFINE + "----" + Configure.RELATION_DEFINED_BY)
                }
            }
            if(entity instanceof ClassEntity){
                for(childId of entity.getChildrenIds()){
                    this.depVisitor.saveRelation(entity.getId(), childId, Configure.RELATION_DEFINE, Configure.RELATION_DEFINED_BY);
                    //console.log(entity.getId() + "---" + childId + "----" + Configure.RELATION_DEFINE + "----" + Configure.RELATION_DEFINED_BY)
                }
            }
            if(entity instanceof MethodEntity){
                for(childId of entity.getChildrenIds()){
                    this.depVisitor.saveRelation(entity.getId(), childId, Configure.RELATION_DEFINE, Configure.RELATION_DEFINED_BY);
                    //console.log(entity.getId() + "---" + childId + "----" + Configure.RELATION_DEFINE + "----" + Configure.RELATION_DEFINED_BY)
                }
            }
            if(entity instanceof VarEntity){
                for(childId of entity.getChildrenIds()){
                    this.depVisitor.saveRelation(entity.getId(), childId, Configure.RELATION_DEFINE, Configure.RELATION_DEFINED_BY);
                    //console.log(entity.getId() + "---" + childId + "----" + Configure.RELATION_DEFINE + "----" + Configure.RELATION_DEFINED_BY)
                }
            }
            if(entity instanceof PropertyEntity){
                for(childId of entity.getChildrenIds()){
                    this.depVisitor.saveRelation(entity.getId(), childId, Configure.RELATION_DEFINE, Configure.RELATION_DEFINED_BY);
                    //console.log(entity.getId() + "---" + childId + "----" + Configure.RELATION_DEFINE + "----" + Configure.RELATION_DEFINED_BY)
                }
            }
        }
        //console.log(this.singleCollect.getEntities())
    }

    isImport(childId:number,entity:object){
        let flag;
        let name = Array.from(this.singleCollect.getEntities())[childId].simpleName;
          if(entity instanceof ModuleEntity){
              for(let importStmt of entity.getImportStmts()){
                  if(importStmt.getImpor() == name){
                     //import {a} from "./**"  导入的
                       flag = true;
                       return flag;
                  }else{
                      flag = false;
                  }
              }
          }
          return flag;
    }
}
export default DefineVisitor;