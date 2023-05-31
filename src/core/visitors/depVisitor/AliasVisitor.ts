import DepVisitor from "./DepVisitor";
import ModuleEntity from "../../entities/ModuleEntity";
import Configure from "../../utils/Configure";
import FunctionEntity from "../../entities/FunctionEntity";
import ClassEntity from "../../entities/ClassEntity";
import VarEntity from "../../entities/VarEntity";

class AliasVisitor extends DepVisitor {
    depVisitor = new DepVisitor();
    setDep(){
        //export {a as ee}
        //import {rrr as e,func} from ...;
        //import * as t from...
        let str:any;
        let moduleId;
        for(let entity of this.singleCollect.getEntities()){
            if(entity instanceof ModuleEntity){
                moduleId = entity.getId();
                let exportAliasMap = entity.getExportAlias();
                let importAliasMap = entity.getImportsAlias();
                for(str of exportAliasMap.keys()){
                        let exportId = this.findStrInMod(moduleId,str);
                        let aliasId = exportAliasMap.get(str);
                        if(exportId !== undefined && aliasId !== undefined){
                            this.depVisitor.saveRelation(exportId, aliasId,Configure.RELATION_ALIAS, Configure.RELATION_ALIASED_BY);
                            //console.log(exportId+"---"+aliasId+"----"+Configure.RELATION_ALIAS+"----"+Configure.RELATION_ALIASED_BY)
                        }
                }
                for(str of importAliasMap.keys()){
                        let exportId = this.findStrInMod(moduleId,str);
                        let aliasId = importAliasMap.get(str);
                        if(exportId !== undefined && aliasId !== undefined){
                            this.depVisitor.saveRelation(exportId, aliasId,Configure.RELATION_ALIAS, Configure.RELATION_ALIASED_BY);
                            //console.log(exportId+"---"+aliasId+"----"+Configure.RELATION_ALIAS+"----"+Configure.RELATION_ALIASED_BY)
                    }
                }
            }
        }
        //console.log(this.singleCollect.getEntities())
    }

    findStrInMod(moduleId:number,str:string){
        let id;
        let childObj;
        for(let entity of this.singleCollect.getEntities()){
            if(entity instanceof ModuleEntity){
                if(entity.getSimpleName() == str){
                    return entity.getId();
                }
            }
        }
        let modObj = Array.from(this.singleCollect.getEntities())[moduleId];
        let ids = modObj.getChildrenIds();
        for(id of ids){
            childObj = Array.from(this.singleCollect.getEntities())[id];
            if(childObj instanceof FunctionEntity || childObj instanceof ClassEntity || childObj instanceof VarEntity) {
                if (childObj.getSimpleName() == str) {
                    return id;
                }
            }
        }
        return this.getMatchImportedId(moduleId,str);
      }

    getMatchImportedId(moduleId:any,str:string){
        let importStmt:any;
        let importedName;
        let entityObj = (Array.from(this.singleCollect.getEntities()))[moduleId];
        for(let relation of entityObj.getRelations()){
            if(relation.x == Configure.RELATION_IMPORT) {
                //importedId = relation.y
                let index = entityObj.getImportedId2Indexs().get(relation.y);
                importStmt = (Array.from(entityObj.getImportStmts()))[index];
                // @ts-ignore
                if((importStmt.getAs()) == ""){
                    importedName = importStmt.getImpor();
                    if(importedName == str) {
                        return relation.y;
                    }
                } else {
                    importedName = importStmt.getAs();
                    if(importedName == str){
                        return relation.y;
                    }
                }
            }
        }
    }
}
export default AliasVisitor;