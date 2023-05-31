import DepVisitor from "./DepVisitor";
import ModuleEntity from "../../entities/ModuleEntity";
import Configure from "../../utils/Configure";

class DeclareExportVisitor extends DepVisitor {
    depVisitor = new DepVisitor();
    setDep(){
        for(let entity of this.singleCollect.getEntities()){
            if(entity instanceof ModuleEntity){
                let moduleId = entity.getId();
                let exportMap = entity.getDeclareExportId2Str();
                exportMap.forEach((value, key) => {
                    if(key !== -1) {
                        this.depVisitor.saveRelation(moduleId, key, Configure.RELATION_DECLAREEXPORT, Configure.RELATION_DECLAREEXPORTED_BY)
                        //console.log(moduleId+"---"+key+"----"+Configure.RELATION_DECLAREEXPORT+"----"+Configure.RELATION_DECLAREEXPORTED_BY)
                    }
                })
            }
        }
    }
}
export default DeclareExportVisitor;