import DepVisitor from "./DepVisitor";
import VarEntity from "../../entities/VarEntity";
import ModuleEntity from "../../entities/ModuleEntity";
import Configure from "../../utils/Configure";
import FunctionEntity from "../../entities/FunctionEntity";
import ClassEntity from "../../entities/ClassEntity";
import MethodEntity from "../../entities/MethodEntity";
import PropertyEntity from "../../entities/PropertyEntity";

class InitVisitor extends DepVisitor {
    depVisitor = new DepVisitor();
    //1.对于所有的globalVar，只要init部分存在，都是js文件与globalVar之间发生Init关系，functionExp只有define关系，无init关系，
    //2.对象属性右侧赋值了，说明这个prop在此对象中Init,有可能为全局对象，可能为局部
    //3.funcOrclass中的localVar,只要init存在，就是父类initlocalVar
    setDep(){
        let idList;
        let scopeId;
        for(let entity of this.singleCollect.getEntities()){
            if(entity instanceof ModuleEntity || entity instanceof FunctionEntity || entity instanceof MethodEntity
               || entity instanceof VarEntity || entity instanceof PropertyEntity){
                idList = entity.getChildrenIds();
                for(let id of idList){
                    let enObj = (Array.from(this.singleCollect.getEntities()))[id];
                    if((enObj instanceof VarEntity && (enObj.getInitType()) !== "") || enObj instanceof ClassEntity && (enObj.getKind() == "ClassExpression")
                        || enObj instanceof PropertyEntity){
                        scopeId = enObj.getParentId();
                        this.depVisitor.saveRelation(scopeId,enObj.getId(),Configure.RELATION_INIT,Configure.RELATION_INITED_BY);
                        //console.log(scopeId+"----"+enObj.getId()+"---"+Configure.RELATION_INIT+"----"+Configure.RELATION_INITED_BY)
                    }
                }
            }
        }
       // console.log(this.singleCollect.getEntities())
    }
}
export default InitVisitor;