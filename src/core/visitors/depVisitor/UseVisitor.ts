import DepVisitor from "./DepVisitor";
import FunctionEntity from "../../entities/FunctionEntity";
import Configure from "../../utils/Configure";
import ModuleEntity from "../../entities/ModuleEntity";
import MethodEntity from "../../entities/MethodEntity";
import VarEntity from "../../entities/VarEntity";
 //F:\test\test_wrong2.js
class UseVisitor extends DepVisitor{
    depVisitor = new DepVisitor();
     setDep() {
         for (let entity of this.singleCollect.getEntities()) {
             if (entity instanceof FunctionEntity || entity instanceof ModuleEntity
             || entity instanceof MethodEntity || entity instanceof VarEntity) {
                 let finalUsages = entity.getFinalUsageMap();
                 //console.log(finalUsages)
                 finalUsages.forEach((value, key) => {
                     if (key == "use") {
                        let valuesMap = finalUsages.get(key);
                         //console.log(valuesMap)
                         // @ts-ignore
                         valuesMap.forEach((value, key) =>{
                             let usageId = key;
                             let weight = value;
                             if(usageId !== undefined){
                                 this.depVisitor.saveRelation(entity.getId(), usageId, Configure.RELATION_USE, Configure.RELATION_USED_BY);
                               // console.log(entity.getId() + "---" + usageId + "----" + Configure.RELATION_USE + "----" + Configure.RELATION_USED_BY)
                             }
                         })
                     }
                 })
             }
         }
     }
}
export default UseVisitor;