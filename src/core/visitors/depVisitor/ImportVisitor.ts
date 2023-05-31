import DepVisitor from "./DepVisitor";
import PackageEntity from "../../entities/PackageEntity";
import ModuleEntity from "../../entities/ModuleEntity";
import Entity from "../../entities/Entity";
import Configure from "../../utils/Configure";
import VarEntity from "../../entities/VarEntity";
import ProcessEntity from "../entityVisitor/ProcessEntity";


class ImportVisitor extends DepVisitor {
    depVisitor = new DepVisitor();
    processEntity = new ProcessEntity();
    exportMap = new Map();

    /**
     * if find the import entityVisitor, then save to entityVisitor relation
     */
    setDep() {
        let imp_str = "";
        let from = "";
        this.exportMap = this.getExportMap();
        for (let entity of this.singleCollect.getEntities()) {
            let importStmts = null;
            if (entity instanceof ModuleEntity) {
                importStmts = entity.getImportStmts();
            }
            if (importStmts == null) {
                continue;
            }
            // console.log(this.exportMap)
            if(importStmts.length >= 0) {
                for (let index = 0; index < importStmts.length; index++) {
                    let importStmt = (Array.from(importStmts))[index];

                    //case1:

                    // impor from都不空，变量导入
                    if((importStmt.getFrom() && importStmt.getImpor())) {
                        imp_str = importStmt.getImpor();
                        from  = importStmt.getFrom();
                        let fromId = this.findImportFromId(from);

                        if(fromId !== -1) {
                           let imporIds = this.findImpStrId(fromId,imp_str);
                           if(imporIds !== undefined && imporIds.size > 0) {
                               imporIds = this.getFinalIds(imporIds);
                               for(let imporId of imporIds) {
                                   if(imporId !== -1){
                                       //save (importedID, importsList_index) into Entity
                                       // @ts-ignore
                                       this.saveId2Id(entity.getId(), imporId, index);
                                       // @ts-ignore
                                       this.depVisitor.saveRelation(entity.getId(), imporId, Configure.RELATION_IMPORT, Configure.RELATION_IMPORTED_BY);
                                       // console.log(entity.getQualifiedName()+"---"+imp_str+"----"+Configure.RELATION_IMPORT+"----"+Configure.RELATION_IMPORTED_BY);
                                       // console.log(entity.getId()+"---"+imporId+"----"+Configure.RELATION_IMPORT+"----"+Configure.RELATION_IMPORTED_BY);
                                   } else {
                                       //有导入，未找到导出
                                       let varId = this.processUnresolved(entity.getId(),imp_str);
                                       if(varId !== -1 && varId !== undefined){
                                           // @ts-ignore
                                           this.depVisitor.saveRelation(entity.getId(), varId, Configure.RELATION_UNRESOLVEDIMPORT, Configure.RELATION_UNRESOLVEDIMPORTED_BY);
                                          //  console.log(entity.getQualifiedName()+"---"+imp_str+"----"+Configure.RELATION_UNRESOLVEDIMPORT+"----"+Configure.RELATION_UNRESOLVEDIMPORTED_BY);
                                          // console.log(entity.getId()+"---"+varId+"----"+Configure.RELATION_UNRESOLVEDIMPORT+"----"+Configure.RELATION_UNRESOLVEDIMPORTED_BY);
                                       }
                                   }
                               }
                           }
                        } else {
                            //可能是其他类型文件
                            //处理为变量，unresolved import
                           let varId = this.processUnresolved(entity.getId(),imp_str);
                           if(varId !== -1 && varId !== undefined){
                                // @ts-ignore
                                this.depVisitor.saveRelation(entity.getId(), varId, Configure.RELATION_UNRESOLVEDIMPORT, Configure.RELATION_UNRESOLVEDIMPORTED_BY);
                               // console.log(entity.getQualifiedName()+"---"+imp_str+"----"+Configure.RELATION_UNRESOLVEDIMPORT+"----"+Configure.RELATION_UNRESOLVEDIMPORTED_BY);
                               // console.log(entity.getId()+"---"+varId+"----"+Configure.RELATION_UNRESOLVEDIMPORT+"----"+Configure.RELATION_UNRESOLVEDIMPORTED_BY);
                           }
                        }
                    } else if(importStmt.getFrom() == "" ){
                        //from为空，文件导入 import "./file.js"
                        let fromId = this.findImportFromId(importStmt.getImpor());
                        imp_str = importStmt.getImpor();

                        if (fromId !== -1 && fromId !== undefined) {
                            this.saveId2Id(entity.getId(), fromId, index);
                            this.depVisitor.saveRelation(entity.getId(), fromId, Configure.RELATION_IMPORT, Configure.RELATION_IMPORTED_BY);
                            //console.log(entity.getQualifiedName()+"---"+imp_str+"----"+Configure.RELATION_IMPORT+"----"+Configure.RELATION_IMPORTED_BY);
                            //console.log(entity.getId()+"---"+fromId+"----"+Configure.RELATION_IMPORT+"----"+Configure.RELATION_IMPORTED_BY);
                        } else {
                            // import "./file.html"等其他类型文件
                            let moduleId = this.processEntity.processModule(importStmt.getImpor(),-2);
                            // @ts-ignore
                            this.depVisitor.saveRelation(entity.getId(), moduleId, Configure.RELATION_UNRESOLVEDIMPORT, Configure.RELATION_UNRESOLVEDIMPORTED_BY);
                            //console.log(entity.getQualifiedName()+"---"+imp_str+"----"+Configure.RELATION_UNRESOLVEDIMPORT+"----"+Configure.RELATION_UNRESOLVEDIMPORTED_BY);
                            //console.log(entity.getId()+"---"+moduleId+"----"+Configure.RELATION_UNRESOLVEDIMPORT+"----"+Configure.RELATION_UNRESOLVEDIMPORTED_BY);
                        }
                    }
                }
            }
        }
    }

    getExportMap() {
        for (let entity of this.singleCollect.getEntities()) {
            let exportSet = new Set();
            let declareExportId2Str = null;
            let declareDefaultExportId2Str = null;
            let defineExportId2Str = null;
            let defineDefaultExportId2Str = null;
            if (entity instanceof ModuleEntity) {
                declareExportId2Str = entity.getDeclareExportId2Str();
                declareDefaultExportId2Str = entity.getDeclareExportDefaultId2Str();
                defineExportId2Str = entity.getDefineExportId2Str();
                defineDefaultExportId2Str = entity.getDefineDefaultExportId2Str();
                exportSet.add(declareExportId2Str)
                exportSet.add(declareDefaultExportId2Str)
                exportSet.add(defineExportId2Str)
                exportSet.add(defineDefaultExportId2Str)
                this.exportMap.set(entity.getId(), exportSet);
            }
        }
        return this.exportMap;
    }

    getFinalIds(imporIds:Set<number>) {
        if(imporIds.size > 1){
            if(imporIds.has(-1)){
                imporIds.delete(-1);
            }
        }
        return imporIds;
    }

    processUnresolved(parentId:number,imp_str:string) {
        let varId;
        let childrenIds = Array.from(this.singleCollect.getEntities())[parentId].getChildrenIds();
        for(let childId of childrenIds){
            let childObj = Array.from(this.singleCollect.getEntities())[childId];
            if(childObj instanceof VarEntity && childObj.getSimpleName() == imp_str){
                varId = childObj.getId();
                break;
            }
        }
        return varId;
    }

    findImportFromId(from:string) {
        let entityId = -1;
        //可能以json，html,css结尾，如果默认是没有以js结尾的，加上js
        if(!(from.includes(".")) && !(from.endsWith(".js"))){
            from = from + ".js"
        }
        // console.log(from)
        for(let entity of this.singleCollect.getEntities()) {
            if(entity instanceof ModuleEntity) {
                if(entity.getSimpleName() == from) {
                    entityId = entity.getId();
                    return entityId;
                }
            }
        }
        return entityId;
    }

    findImpStrId(fromId:number,imporStr:string){
        //对于导入str,循环所有的导出map，在map中找是否有导出
       if(this.exportMap.size >= 0) {
           let imporIds = new Set<number>();
           this.exportMap.forEach((value, key, map) => {
               if(key == fromId) {
                   for(let items of value) {
                       if(items !== null) {
                           //item是导出Map,其中含有多个导出，循环它，找到需要的之后保存，不再执行循环
                           for(let item of items) {
                               if(item[1] == imporStr){
                                  imporIds.add(item[0]);
                               } else {
                                   imporIds.add(-1);
                               }
                           }
                       } else {
                           imporIds.add(-1);
                       }
                   }
                   // 如果存在，则返回exportId，当前文件与Id的Import关系
                   // 如果不存在，处理为变量，当前文件与变量的Import关系
               } else {
                   //没有找到fromId有相应的导出
                   imporIds.add(-1);
               }
           })
           return imporIds;
       }
    }


    saveId2Id(entityId:number, importedId:number, index:number){
        let entityObj = (Array.from(this.singleCollect.getEntities()))[entityId];
        if(entityObj instanceof ModuleEntity) {
            entityObj.updateImportedId2Indexs(importedId, index);
        }
    }
}
export default ImportVisitor;