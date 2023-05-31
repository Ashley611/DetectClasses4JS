import SingleCollect from "../../utils/SingleCollect";
import VarEntity from "../../entities/VarEntity";
import ModuleEntity from "../../entities/ModuleEntity";
import Configure from "../../utils/Configure";
import FunctionEntity from "../../entities/FunctionEntity";
import MethodEntity from "../../entities/MethodEntity";
import ClassEntity from "../../entities/ClassEntity";
import RelationTuple from "../../utils/RelationTuple";
import PackageEntity from "../../entities/PackageEntity";
/**
 * build scopeMap for each entityVisitor
 *  in each scope (module, class, function, method), record the visible name and its binding entityVisitor
 *
 *  Module: children, imported name.
 *  Function: children, parameter, located module's visible name, imported name.
 *  Class: children, self, BaseClass full name,
 *         BaseClass's children (from left to right, depth first, no-duplicated),
 *         located module's visible name.
 *  Method: children, parameter, self, BaseClass full name, located module's visible name, imported name.
 *  package: init's scope, childname.
 *  class object: class's child
 *  VarObj: parentObj's children,varObj's children
 */

class NameSearch{
    private static nameSearchInstance = new NameSearch();
    private singleCollect = SingleCollect.getSingleCollectInstance();
    //(scopeId, (name, nameEntityId))
    private nameMap = new Map<number, Map<string, number>>();

    getNameMap() {
        return this.nameMap;
    }

    getNameMapOfScope(scopeId:number) {
        if(this.nameMap.has(scopeId)) {
            return this.nameMap.get(scopeId);
        }
        else {
            return null;
        }
    }

    static getNameSearchInstance() {
        return NameSearch.nameSearchInstance;
    }

    /**
     * in scope with scopeId, get the entityVisitor Id by name.
     * if not found, return -1.
     * @param name
     * @param scopeId
     * @return
     */
    getIdByNameInScope(name:string, scopeId:number):number {
        //console.log(name+"......."+scopeId)
        //console.log(this.nameMap)
        if(this.nameMap.has(scopeId)) {
            // @ts-ignore
            if((this.nameMap.get(scopeId)).has(name)) {
                // @ts-ignore
                return this.nameMap.get(scopeId).get(name);
        }
    }
        return -1;
    }

    /**
     * cannot change the order, since the scope is a hierarchy.
     */
    buildNameScope() {
        this.buildNameScopeForModules();
        this.buildNameScopeForFunctions();
        this.buildNameScopeForClasses();
        this.buildNameScopeForMethods();
        this.buildNameScopeForPackages();
        this.buildNameScopeForVar();

    }


    /**
     * Module: children, imported name.
     */
    buildNameScopeForModules() {
        for(let entity of this.singleCollect.getEntities()) {
            if(entity instanceof ModuleEntity) {
                let moduleId = entity.getId();
                this.addInChildren(moduleId, moduleId);
                this.addInImports(moduleId, moduleId);
            }
        }
        //console.log(this.getNameMap())
    }

    /**
     * Function: children,
     *  parameter,
     *  located module's visible name (module children + module import), imported name.
     */
    buildNameScopeForFunctions() {
        for (let entity of this.singleCollect.getEntities()) {
            if (entity instanceof FunctionEntity) {
                //save children and para for itself
                let functionId = entity.getId();
                this.addInChildren(functionId, functionId);
                this.addInParas(functionId, functionId);
                let parentId = entity.getParentId();
                let parentObj = (Array.from(this.singleCollect.getEntities()))[parentId];
                //top-level
                //find Parent,parent is Module Or Func
                while(!(parentObj instanceof ModuleEntity)){
                    this.addInChildren(functionId, parentId);
                    parentId = parentObj.getParentId();
                    parentObj = Array.from(this.singleCollect.getEntities())[parentId];
                }
                if(parentId != -1 && parentObj instanceof ModuleEntity) {
                    this.addInChildren(functionId, parentId);
                    this.addInImports(functionId, parentId);
                }
           }
     }
        //console.log(this.getNameMap())
}

    /**
     * Class: children,self
     *         BaseClass full name,
     *         BaseClass's children (from left to right, breadth first, no-duplicated),
     */
    buildNameScopeForClasses() {
        for(let entity of this.singleCollect.getEntities()) {
            if(entity instanceof ClassEntity) {
                let classId = entity.getId();
                this.addInChildren(classId, classId);
                this.addInBaseClassName(classId, classId);
                this.addInBaseClassChildren(classId, classId);
                let classEntity = (Array.from(this.singleCollect.getEntities()))[classId];
                let parentId = classEntity.getParentId();
                let parentEntity = (Array.from(this.singleCollect.getEntities()))[parentId];
                if(parentId != -1 && parentEntity instanceof ModuleEntity) {
                     this.addInChildren(classId, parentId);
                    this.addInImports(classId, parentId);
                }
            }
        }
         //console.log(this.getNameMap())
         //console.log(this.singleCollect.getEntities())
    }

    /**
     * Method: children, parameter,self, BaseClass full name, located module's visible name, imported name.
     */
    buildNameScopeForMethods() {
        for(let entity of this.singleCollect.getEntities()) {
            if(entity instanceof MethodEntity && !(entity.getSimpleName().includes("UnresolvedMethod_"))) {
                let methodId = entity.getId();
                let methodEntity = (Array.from(this.singleCollect.getEntities()))[methodId];
                let parentId = methodEntity.getParentId();
                this.addInChildren(methodId, methodId);
                this.addInParas(methodId, methodId);
                this.addInBaseClassName(methodId, parentId);
                let parententity = (Array.from(this.singleCollect.getEntities()))[parentId];
                let grandPaId = parententity.getParentId();
                let grandpaEntity = (Array.from(this.singleCollect.getEntities()))[grandPaId];
                if(grandPaId != -1 && grandpaEntity instanceof ModuleEntity) {
                    this.addInChildren(methodId, grandPaId);
                    this.addInImports(methodId, grandPaId);
                }
            }
        }
         //console.log(this.getNameMap())
        // console.log(this.singleCollect.getEntities())
    }

    /**
     * package: itschildren's name- module simple Name
     */
    buildNameScopeForPackages() {
        for (let entity of this.singleCollect.getEntities()) {
            if (entity instanceof PackageEntity) {
                let packageId = entity.getId();
                this.addInChildren(packageId, packageId);
                }
            }
       // console.log(this.nameMap)
        // console.log(this.singleCollect.getEntities())
    }

    /**
     * var: children's name, parentObj's (module,function,method) children's name
     */
    buildNameScopeForVar() {
        for(let entityVisitor of this.singleCollect.getEntities()) {
            if (entityVisitor instanceof VarEntity) {
                let scopeId = entityVisitor.getId();
                let parentId = entityVisitor.getParentId();
                //先把var的孩子节点加进去
                this.addInChildren(scopeId, scopeId);
                //判断var是全局还是局部变量，全局变量把module的孩子加进去，局部变量，就把父类(一直向上找，直到找到module)的孩子都加进去，
                let parentObj = Array.from(this.singleCollect.getEntities())[parentId];
                while(!(parentObj instanceof ModuleEntity)){
                    this.addInChildren(scopeId,parentId);
                    parentId = parentObj.getParentId();
                    parentObj = Array.from(this.singleCollect.getEntities())[parentId];
                }
                if(parentObj instanceof ModuleEntity){
                    this.addInChildren(scopeId,parentId);
                }
                //this.addInChildren(scopeId, parentId);
            }
        }
        //console.log(this.nameMap)
    }

    /**
     * add entityId's children's names into scopeId
     * @param scopeId
     * @param entityId
     */
    addInChildren(scopeId:number, entityId:number) {
        if(entityId == -1) {
            return;
        }
        let entity = (Array.from(this.singleCollect.getEntities()))[entityId];
        for(let childId of entity.getChildrenIds()) {
            let childEntity = (Array.from(this.singleCollect.getEntities()))[childId];
            if(childEntity !== undefined){
                let childName = childEntity.getSimpleName();
                if(entity instanceof ModuleEntity) {
                    if(entity.getImportStmts()){
                        let importStmts = entity.getImportStmts();
                        for(let importStmt of importStmts){
                            let imporName = importStmt.getImpor();
                            let asName = importStmt.getAs();
                            if((childName == imporName || childName == asName) && childEntity instanceof VarEntity){
                                //说明这个孩子是导入的，被处理成了一个Var,它暂时不加入Map中
                                continue;
                            }
                        }
                        this.addNameMap(scopeId, childName, childId);
                    }
                }else{
                    this.addNameMap(scopeId, childName, childId);
                }
            }
        }
        //console.log(this.getNameMap())
    }

    /**
     * add function or module's imported name into scopeId
     * @param scopeId
     * @param functionOrModuleId
     */
    addInImports(scopeId:number, moduleId:number) {
        let importStmts;
        let importedId2Indexes;
        let from;
        let entity = (Array.from(this.singleCollect.getEntities()))[moduleId];
        if(moduleId == -1) {
            return;
        }

        if (entity instanceof ModuleEntity) {
            importStmts =  entity.getImportStmts();
            importedId2Indexes = entity.getImportedId2Indexs();
        }
        if(importedId2Indexes == null || importStmts == null) {
            return;
        }
        for (let relation of entity.getRelations()) {
            if(relation.x == Configure.RELATION_IMPORT) {
                let importedName;
                let importedId = relation.y;
                let index = importedId2Indexes.get(importedId);
                // @ts-ignore
                let importStmt = (Array.from(importStmts))[index];
                if(importStmt !== undefined) {
                    importedName = importStmt.getImpor();
                }
                //这里对impor内容判断，可能为*，可能为字符，可能为不带点的文件名（as和from都空时）
               if(importedName && importStmt.getAs()){
                   if(importedName == "*"){
                       from = importStmt.getFrom();
                       if(!(from.endsWith(".js"))){
                           from = from + ".js";
                       }
                       for(let mod of this.singleCollect.getEntities()){
                           if(mod instanceof ModuleEntity){
                               if(from == mod.getSimpleName()){
                                   let modId = mod.getId();
                                   this.addInChildren(moduleId,modId);
                               }
                           }
                       }
                   }else if(importedName !== "*"){
                       if(!(importStmt.getAs() == "")) {
                           importedName = importStmt.getAs();
                       }
                       this.addNameMap(scopeId, importedName, importedId);
                   }
               }else if(importedName && importStmt.getAs() == "" && importStmt.getFrom() == ""){
                   if(!(importedName.endsWith(".js"))){
                       importedName = importedName + ".js";
                   }
                   for(let mod of this.singleCollect.getEntities()){
                       if(mod instanceof ModuleEntity){
                           if(importedName == mod.getSimpleName()){
                               let modId = mod.getId();
                               this.addInChildren(moduleId,modId);
                           }
                       }
                   }
               }
                // if(!(importStmt.getAs() == "")) {
                //     importedName = importStmt.getAs();
                // }
                //
                // //console.log(scopeId+"."+importedName)
                // this.addNameMap(scopeId, importedName, importedId);

            }
        }
}

    /**
     * add functionId's parameter into scopeId
     * @param scopeId
     * @param functionId
     */
    addInParas(scopeId:number, functionId:number) {
        if(functionId == -1) {
            return;
        }
        let funcEntity = (Array.from(this.singleCollect.getEntities()))[functionId];
        for (let paraId of (funcEntity.getParameters())) {
            let paraEntity = (Array.from(this.singleCollect.getEntities()))[paraId];
            let paraName = paraEntity.getSimpleName();
            this.addNameMap(scopeId, paraName, paraId);
        }
}

    /**
     * add classId's baseclass name (original used name) into scopeId
     * @param scopeId
     * @param classId
     */
    addInBaseClassName(scopeId:number, classId:number) {
        let baseClassName:any;
        let baseClassId:any;
        if(classId == -1) {
            return;
        }
        let classEntity = (Array.from(this.singleCollect.getEntities()))[classId];
        if(classEntity instanceof ClassEntity){
            for(let index = 0; index < classEntity.getBaseClassIdList().size; index++ ) {
                baseClassId = (Array.from(classEntity.getBaseClassIdList()))[index];
                //let baseClassId = classEntity.getBaseClassIdList().get(index);
                baseClassName = (Array.from(classEntity.getBaseClassNameList()))[index];
                //let baseClassName = classEntity.getBaseClassNameList().get(index);
                if(baseClassId == -1) {
                    continue;
                }
                this.addNameMap(scopeId, baseClassName, baseClassId);
            }
        }

    }

    /**
     * add classdId's  baseclass's children into scopeId
     * depth first add, from left to right.
     * @param scopeId
     * @param classId
     */
    addInBaseClassChildren(scopeId:number, classId:number) {
        if(classId == -1) {
            return;
        }
        //parent(depth first) list
        let allBaseClasses = new Set<RelationTuple<number, string>>();
        this.findBasesClassesInDepth(allBaseClasses, classId);

        for (let baseInfo of allBaseClasses) {
            // @ts-ignore
            let baseId = baseInfo.x;
            //String baseName = baseInfo.y;
            //addNameMap(scopeId, baseName, baseId);
            let baseEntity = (Array.from(this.singleCollect.getEntities()))[baseId];
            if(baseEntity !== undefined){
                for(let childId of baseEntity.getChildrenIds()) {
                    let childEntity = (Array.from(this.singleCollect.getEntities()))[childId];
                    let childName = childEntity.getSimpleName();
                    this.addNameMap(scopeId, childName, childId);
                }
            }

        }
}

    /**
     * find parent(depth first) list
     * @param classId
     * @return
     */
    findBasesClassesInDepth(allBaseClasses:Set<RelationTuple<number, string>> , classId:number) {
        if(classId == -1) {
            return;
        }
        //console.log(classId)
        let classEntity = (Array.from(this.singleCollect.getEntities()))[classId];
        if(classEntity !== undefined && classEntity instanceof ClassEntity){
            let baseNameList = classEntity.getBaseClassNameList();
            let baseIdList = classEntity.getBaseClassIdList();
            if(baseNameList.size > 0 && baseIdList.size > 0){
                 for(let index = 0; index < baseIdList.size; index++) {
                     let baseId = (Array.from(baseIdList))[index];
                     let baseName = (Array.from(baseNameList))[index];
                     // @ts-ignore
                     if(baseId != -1 && !this.isInList(baseId, allBaseClasses)) {
                         // @ts-ignore
                         let baseInfo = new RelationTuple<number, string>(baseId, baseName);
                         allBaseClasses.add(baseInfo);
                         // @ts-ignore
                         this.findBasesClassesInDepth(allBaseClasses, baseId);
                     }
                 }
           }
        }
}

    /**
     * judge the entityId is in list ot not
     * @param entityId
     * @param tupleList
     * @return
     */
    isInList(entityId:number, tupleList:Set<RelationTuple<number, string>>) {
        for(let tuple of tupleList) {
            if(entityId == tuple.x) {
            return true;
            }
        }
            return false;
    }

    /** {scopeId, {name, nameId}}
     * if duplicated, not add it.
     * @param scopeId
     * @param name
     * @param nameId
     */
    addNameMap(scopeId:number, name:string, nameId:number) {
        //console.log(scopeId + "  " +name +" "+nameId)
        if (!this.nameMap.has(scopeId)) {
            this.nameMap.set(scopeId, new Map<string, number>());
        }
        // @ts-ignore
        if (!this.nameMap.get(scopeId).has(name)) {
            // @ts-ignore
            this.nameMap.get(scopeId).set(name, nameId);
        }
    }
}
export default NameSearch;