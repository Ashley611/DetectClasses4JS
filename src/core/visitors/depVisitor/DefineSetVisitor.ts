import DepVisitor from "./DepVisitor";
import Configure from "../../utils/Configure";
import PropertyEntity from "../../entities/PropertyEntity";
import ModuleEntity from "../../entities/ModuleEntity";
import VarEntity from "../../entities/VarEntity";
import MethodEntity from "../../entities/MethodEntity";

class DefineSetVisitor extends DepVisitor {
    depVisitor = new DepVisitor();

    setDep() {
        //module.exports=**, a.b = function A(){}....
        //不一定是module.exports,未出现过的，表达式定义的，都是defineSet
        //let a={c:1},普通的set
        for (let entity of this.singleCollect.getEntities()) {
            if (entity instanceof PropertyEntity) {
                let propId = entity.getId();
                let parentObj = (Array.from(this.singleCollect.getEntities()))[entity.getParentId()];

                let originParentObj = parentObj;
                while (parentObj !== undefined && !(parentObj instanceof ModuleEntity)) {
                    let parentId = parentObj.getParentId();
                    parentObj = (Array.from(this.singleCollect.getEntities()))[parentId];
                }
                if(parentObj !== undefined){
                    let modId = parentObj.getId();
                    if (originParentObj instanceof VarEntity && originParentObj.getInitType() == "ObjectExpression") {
                        continue;
                    }else{
                        this.depVisitor.saveRelation(modId, propId, Configure.RELATION_DEFINESET, Configure.RELATION_DEFINESETED_BY);
                        //console.log(modId + "---" + propId + "----" + Configure.RELATION_DEFINESET + "----" + Configure.RELATION_DEFINESETED_BY)
                    }
                }
            }
        }
        //console.log(this.singleCollect.getEntities())
    }
}

export default DefineSetVisitor;