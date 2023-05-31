import SingleCollect from "../utils/SingleCollect";
import Configure from "../utils/Configure";
import ModuleEntity from "../entities/ModuleEntity";
import JsRelationInfo from "../visitors/JsRelationInfo";
import PackageEntity from "../entities/PackageEntity";
import {inspect} from "util";

class Relation{

     singleCollect = SingleCollect.getSingleCollectInstance();
     relationInfo = new JsRelationInfo();

     getEntityInfo(){
         return this.relationInfo.entityStatis();
     }

     getRelationInfo(){
         return this.relationInfo.dependencyStatis();
     }

     getClassTypeInfo() {
         return this.relationInfo.classTypeStatis();
     }

     // getUserDefinedType(){
     //     return this.relationInfo.getUserDefinedTypes();
     // }

     getDepByType(level:string, depType:string) {
        if(depType == Configure.RELATION_IMPORT) {
            return this.relationInfo.getImportDeps(level);
        }
        if(depType == Configure.RELATION_IMPORTFROM) {
            return this.relationInfo.getImportFromDeps(level);
        }
        if(depType == Configure.RELATION_DEFINE) {
            return this.relationInfo.getDefineDeps(level);
        }
        if(depType == Configure.RELATION_CALL) {
            return this.relationInfo.getCallDeps(level);
        }
        if(depType == Configure.RELATION_CALL_NEW) {
            return this.relationInfo.getCallNewDeps(level);
        }
        if(depType == Configure.RELATION_CALLPOINTER) {
            return this.relationInfo.getPointerDeps(level);
        }
        if(depType == Configure.RELATION_EXTEND) {
            return this.relationInfo.getExtendDeps(level);
        }
        if(depType == Configure.RELATION_SET) {
            return this.relationInfo.getSetDeps(level);
        }
        if(depType == Configure.RELATION_USE) {
            return this.relationInfo.getUseDeps(level);
        }
        if(depType == Configure.RELATION_INIT) {
            return this.relationInfo.getInitDeps(level);
        }
        if(depType == Configure.RELATION_MODIFY) {
            return this.relationInfo.getModifyDeps(level);
        }
        if(depType == Configure.RELATION_DEFINEEXPORT) {
            return this.relationInfo.getDefineExportDeps(level);
        }
        if(depType == Configure.RELATION_DECLAREEXPORT) {
            return this.relationInfo.getDeclareExportDeps(level);
        }
       if(depType == Configure.RELATION_DECLAREDEFAULTEXPORT) {
         return this.relationInfo.getDeclareExportDefaultDeps(level);
       }
        if(depType == Configure.RELATION_DEFINESET) {
            return this.relationInfo.getDefineSetDeps(level);
        }
        if(depType == Configure.RELATION_DEFINEDEFAULTEXPORT) {
            return this.relationInfo.getDefineDefaultExportDeps(level);
        }
        if(depType == Configure.RELATION_ALIAS) {
            return this.relationInfo.getAliasDeps(level);
        }
        return null;

    }


    getAllFiles() {
        let files = new Set<string>();
        for (let entity of this.singleCollect.getEntities()) {
            if(entity instanceof ModuleEntity) {
                let fileName = entity.getQualifiedName();
                files.add(fileName);
            }
        }
        return files;
    }

    //生成变量名集合
    // getAllEntities() {
    //     let entities = new Set<string>();
    //     for (let entity of this.singleCollect.getEntities()) {
    //         let entityName = entity.getQualifiedName();
    //         entities.add(entityName);
    //     }
    //     return entities;
    // }

    //所有实体集合
    getAllEntities() {
      let entities = new Set();
      for (let entity of this.singleCollect.getEntities()) {
          entity.setId(entity.id);
          entities.add(entity);
      }
      return entities;
    }
}

export default Relation;