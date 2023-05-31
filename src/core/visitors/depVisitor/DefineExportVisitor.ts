import DepVisitor from "./DepVisitor";
import ModuleEntity from "../../entities/ModuleEntity";
import Configure from "../../utils/Configure";


class DefineExportVisitor extends DepVisitor {
    depVisitor = new DepVisitor();
    setDep(){
        for (let entity of this.singleCollect.getEntities()) {
            if (entity instanceof ModuleEntity) {
                this.setDefineExportDep(entity.getId());
            }
        }
    }

    //1.export let a=**...
    //2.export {D as y,s},y defineExport
    setDefineExportDep(Id:number){
        let parentObj = (Array.from(this.singleCollect.getEntities()))[Id];
        let exportMap = parentObj.getDefineExportId2Str();
        for (let childId of exportMap.keys()) {
            this.depVisitor.saveRelation(Id, childId, Configure.RELATION_DEFINEEXPORT, Configure.RELATION_DEFINEEXPORTED_BY);
            //console.log(Id+"---"+childId+"----"+Configure.RELATION_DEFINEEXPORT+"----"+Configure.RELATION_DEFINEEXPORTED_BY)
        }
    }
}
export default DefineExportVisitor;