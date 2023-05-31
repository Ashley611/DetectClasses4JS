import DepVisitor from "./DepVisitor";
import ModuleEntity from "../../entities/ModuleEntity";
import Configure from "../../utils/Configure";


class DefineDefaultExportVisitor extends DepVisitor {
    depVisitor = new DepVisitor();
    setDep(){
        for (let entity of this.singleCollect.getEntities()) {
            if (entity instanceof ModuleEntity) {
                this.setDefineDefaultExportDep(entity.getId());
            }
        }
    }

    //1.export default function **
    //2.export default class **
    setDefineDefaultExportDep(Id:number){
        let parentObj = (Array.from(this.singleCollect.getEntities()))[Id];
        let exportMap = parentObj.getDefineDefaultExportId2Str();
        for (let childId of exportMap.keys()) {
            this.depVisitor.saveRelation(Id, childId, Configure.RELATION_DEFINEDEFAULTEXPORT, Configure.RELATION_DEFINEDEFAULTEXPORTED_BY);
            //console.log(Id+"---"+childId+"----"+Configure.RELATION_DEFINEDEFAULTEXPORT+"----"+Configure.RELATION_DEFINEDEFAULTEXPORTED_BY)
        }
    }
}
export default DefineDefaultExportVisitor;