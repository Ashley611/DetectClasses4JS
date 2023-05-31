import DepVisitor from "./DepVisitor";
import ModuleEntity from "../../entities/ModuleEntity";
import Configure from "../../utils/Configure";


class DeclareExportDefaultVisitor extends DepVisitor {
    depVisitor = new DepVisitor();
    setDep(){
        for(let entity of this.singleCollect.getEntities()){
            if(entity instanceof ModuleEntity){
                let moduleId = entity.getId();
                let exportMap = entity.getDeclareExportDefaultId2Str();
                //循环Map,拿到exportId，保存为declareExport关系
                exportMap.forEach((value, key) => {
                    if(key !== -1) {
                        this.depVisitor.saveRelation(moduleId, key, Configure.RELATION_DECLAREDEFAULTEXPORT, Configure.RELATION_DECLAREDEFAULTEXPORTED_BY)
                        //console.log(moduleId+"---"+key+"----"+Configure.RELATION_DECLAREDEFAULTEXPORT+"----"+Configure.RELATION_DECLAREDEFAULTEXPORTED_BY)
                        //console.log(entity.getQualifiedName()+"---"+value+"----"+Configure.RELATION_DECLAREDEFAULTEXPORT+"----"+Configure.RELATION_DECLAREDEFAULTEXPORTED_BY)
                    }
                })
            }
        }
    }
}
export default DeclareExportDefaultVisitor;