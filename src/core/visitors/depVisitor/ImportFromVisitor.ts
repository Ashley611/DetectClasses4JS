import DepVisitor from "./DepVisitor";
import ModuleEntity from "../../entities/ModuleEntity";
import Configure from "../../utils/Configure";

class ImportFromVisitor extends DepVisitor {
    depVisitor = new DepVisitor();

    setDep(){
        for(let entity of this.singleCollect.getEntities()) {
            if(entity instanceof ModuleEntity){
                let scopeId = entity.getId();
                let importStmts = entity.getImportStmts();

                if(importStmts.length > 0){
                    let newFromSet = new Set<string>();
                    for(let importStmt of importStmts){
                        if(importStmt.getFrom() !== ""){
                            newFromSet.add(importStmt.getFrom());
                        }
                    }

                    for(let from of newFromSet){
                        let fromModId = this.findMod(from);
                        if(fromModId !== undefined){
                            // @ts-ignore
                            this.depVisitor.saveRelation(scopeId, fromModId, Configure.RELATION_IMPORTFROM, Configure.RELATION_IMPORTEDFROM_BY);
                            //console.log(entity.getQualifiedName()+"---"+from+"----"+Configure.RELATION_IMPORTFROM+"----"+Configure.RELATION_IMPORTEDFROM_BY);
                        }else{
                            // can not find
                        }
                    }
                }
            }
        }
        //console.log(this.singleCollect.getEntities())
    }

    findMod(str:string){
        // imp.js || imp
        if(str !== undefined){
            for(let entity of this.singleCollect.getEntities()){
                if(entity instanceof ModuleEntity){
                    if(str.endsWith(".js")){
                        if(str == entity.getModuleSimpleName()){
                            return entity.getId();
                        }
                    }else{
                        if(str == entity.getModuleSimpleName().split(".")[0]){
                            return entity.getId();
                        }
                    }
                }
            }
        }
    }

}
export default ImportFromVisitor;