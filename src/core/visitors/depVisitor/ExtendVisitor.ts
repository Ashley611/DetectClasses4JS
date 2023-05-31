import DepVisitor from "./DepVisitor";
import ClassEntity from "../../entities/ClassEntity";
import SingleCollect from "../../utils/SingleCollect";
import Configure from "../../utils/Configure";
import RelationTuple from "../../utils/RelationTuple";
import ModuleEntity from "../../entities/ModuleEntity";
import NameSearch from "../searcher/NameSearch";
import VarEntity from "../../entities/VarEntity";


class ExtendVisitor extends DepVisitor{
    depVistor = new DepVisitor();
    nameSearch = new NameSearch();
    setDep() {
        let baseClassId:any;
        let classObj;
        for(let entity of this.singleCollect.getEntities()) {
            if(entity instanceof ClassEntity){
                for(let baseClassStr of entity.getBaseClassNameList()){
                    if(baseClassStr){
                        baseClassId = this.findBaseClass(baseClassStr, entity.getId());
                       //console.log(baseClassId)
                        if(baseClassId !== -1){
                            classObj = (Array.from(this.singleCollect.getEntities()))[entity.getId()];
                            classObj.addBaseClassId(baseClassId);
                            this.depVistor.saveRelation(entity.getId(), baseClassId, Configure.RELATION_EXTEND, Configure.RELATION_EXTENDED_BY);
                            //console.log(entity.getId()+"---"+baseClassId+"----"+Configure.RELATION_EXTEND+"----"+Configure.RELATION_EXTENDED_BY);
                        }
                      }
                   }
                }
            }
        //console.log(this.singleCollect.getEntities())
        }

    findBaseClass(baseClassStr:string,classId:number) {
        let classObj = (Array.from(this.singleCollect.getEntities()))[classId];
        let scopeId = classObj.getParentId();
        let flag = 1;
        let matchedRes = new RelationTuple(-1, "");
        if(baseClassStr.includes(".")){
            //imported
            // @ts-ignore
            while(baseClassStr.includes(".")) { //imported
                if(flag == 1) {
                    // the first time, it's the imported.
                    // @ts-ignore
                    matchedRes = this.getMatchImportedId(baseClassStr, scopeId);
                    flag = 0;
                }
                else {
                    // other time, it's the children in each scope
                    matchedRes = this.getMatchChildId(baseClassStr, scopeId);
                }
                scopeId = matchedRes.x;
                let matchedStr = matchedRes.y;
                if(scopeId == -1) {
                    return -1;
                }
                baseClassStr = baseClassStr.substring(matchedStr.length + 1, baseClassStr.length);
            }
            if(!(baseClassStr.includes("."))){
                return this.findClassInModule(baseClassStr, scopeId);
            }
        }else{
            return this.findClassInModule(baseClassStr, scopeId);
        }
    }


    getMatchImportedId(baseStr:string,scopeId:number){
        let res = new RelationTuple<number, String>(-1, "");
        let entityObj = (Array.from(this.singleCollect.getEntities()))[scopeId];
        while(scopeId != -1 && !(entityObj instanceof ModuleEntity)) {
            scopeId = entityObj.getParentId();
            entityObj = (Array.from(this.singleCollect.getEntities()))[scopeId];
        }
        if(scopeId == -1) {
            return;
        }

        entityObj = (Array.from(this.singleCollect.getEntities()))[scopeId];
        for(let relation of entityObj.getRelations()) {
            if(relation.x == Configure.RELATION_IMPORT) {
                //int importedId = relation.y;
                let index = entityObj.getImportedId2Indexs().get(relation.y);
                let importStmt = (Array.from(entityObj.getImportStmts()))[index];
                //判断一下导入的名字有没有重命名
                // @ts-ignore
                let importedName = importStmt.getImpor();
                // @ts-ignore
                if(!(importStmt.getAs() == "")) {
                    // @ts-ignore
                    importedName = importStmt.getAs();
                }
                if(baseStr.startsWith(importedName)) {
                    res.x = relation.y;
                    res.y = importedName;
                    return res;
                }
            }
        }
        return res;
    }

    getMatchChildId(baseStr:string, scopeId:number){
        let res = new RelationTuple<number, string>(-1, "");
        for(let childId of (Array.from(this.singleCollect.getEntities()))[scopeId].getChildrenIds()) {
            let childIdObj = Array.from(this.singleCollect.getEntities())[childId];
            if(childIdObj instanceof ClassEntity){
                let childName = childIdObj.getSimpleName();
                if(baseStr == childName) {
                    res.x = childId;
                    res.y = childName;
                    return res;
                }
            }
        }
        return res;
    }

    /**
     * className,moduleId
     */
    findClassInModule(className:string, moduleId:number) {
        let childId:number;
        if (moduleId == -1) {
            return -1;
        }
        if(Array.from(this.singleCollect.getEntities())[moduleId] instanceof ModuleEntity){
            for (childId of (Array.from(this.singleCollect.getEntities())[moduleId]).getChildrenIds()) {
                // console.log(Array.from(this.singleCollect.getEntities())[moduleId])
                let childObj = Array.from(this.singleCollect.getEntities())[childId];
                if(childObj instanceof ClassEntity
                    || (childObj instanceof VarEntity && childObj.getKind() == "GlobalVar" && childObj.getInitType() == "")){
                    if(childObj.getSimpleName() == className) {
                        return childId;
                    }
                }
            }
        }
        if(Array.from(this.singleCollect.getEntities())[moduleId] instanceof ClassEntity){
            //import {A as b} from ""  import对A处理为import关系
            return moduleId;
        }

        //console.log(className)
        // let matchedRes = this.getMatchImportedId(className, moduleId);
        // if(matchedRes){
        //     let scopeId = matchedRes.x;
        //     return scopeId;
        // }
            return -1;
        }
    }

export default ExtendVisitor;