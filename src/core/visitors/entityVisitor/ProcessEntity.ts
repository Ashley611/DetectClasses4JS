import packageEntity from "../../entities/PackageEntity";
import SingleCollect from "../../utils/SingleCollect";
import PathUtil from "../../utils/PathUtil";
import ModuleEntity from "../../entities/ModuleEntity";
import ClassEntity from "../../entities/ClassEntity";
import MethodEntity from "../../entities/MethodEntity";
import ParameterEntity from "../../entities/ParameterEntity";
import FunctionEntity from "../../entities/FunctionEntity";
import VarEntity from "../../entities/VarEntity";
import PropertyEntity from "../../entities/PropertyEntity";
import ImportStmt from "../../entities/ImportStmt";
import LocalName from "../../uerr/LocalName";
import PredefinedObjectEntity from "../../entities/Predefined Object";
import ContextHelper from "./ContextHelper";


class ProcessEntity {
    singleCollect = SingleCollect.getSingleCollectInstance();
    pathUtil = new PathUtil();
    contextHelper = new ContextHelper();

    /**
     *  process the package that has not been created,get the packageId
     */
    processUnCreatedPkg(packageName: string, packagePath: string) {
        let packageId = this.singleCollect.getCurrentIndex();
        let currentPackageEntity = new packageEntity(packageId, packageName, packagePath);
        currentPackageEntity.setSimpleName();
        currentPackageEntity.setParentId(-1);
        this.singleCollect.addEntity(currentPackageEntity);
        return packageId;
    }

    /**
     *  check parent package and supplement the parent
     *  eg.  .../pkg_1/pkg_2/pkg_3(current)
     */
    processParentPackage(pkgQualifiedName: string, packagePath: string, currentPkgId: number) {
        let allPkgName = pkgQualifiedName.split(".");
        let currentId = currentPkgId;
        let correspondId: number;
        let correspondPath = packagePath; //(...//pkg_1//pkg_2//pkg_3)
        let correspondQualifiedName = pkgQualifiedName;//(pkg_1.pkg_2.pkg_3)

        for (let i = allPkgName.length - 2; i >= 0; i--) {
            correspondQualifiedName = PathUtil.deleteLastStrByDot(correspondQualifiedName);
            //check whether it has been created
            if (this.singleCollect.getCreatedPackage().has(allPkgName[i])) {
                //if pkg_2 has been created, get pkg_2 id
                correspondId = this.singleCollect.getPackageId(allPkgName[i]);

            } else {
                //pkg_2 is not be created, get pkg_2's path
                correspondPath = PathUtil.deleteLastStrByPathDelimiter(correspondPath);
                //create pkg_2 entityVisitor and get its id
                correspondId = this.processUnCreatedPkg(correspondQualifiedName, correspondPath);
            }

            //now the currentId is pkg_3, correspondId is pkg_2, pkg_3 is pkg_2's children
            let parentObj = Array.from(this.singleCollect.getEntities()).find(function (item) {
                // @ts-ignore
                return item.id === correspondId;
            })
            // @ts-ignore
            parentObj.addChildId(currentId);

            //pkg_2 is pkg_3‘s parent
            let childObj = Array.from(this.singleCollect.getEntities()).find(function (item) {
                // @ts-ignore
                return item.id === currentId;
            })
            // @ts-ignore
            childObj.setParentId(correspondId);
            //add pkg_2 into created package
            this.singleCollect.addCreatedPackage(correspondId, allPkgName[i])
            //turn currentId to pkg_2
            currentId = correspondId;
        }
    }

    processExport(path:any,id:number,name:string,parentId:number){
        let entity  = Array.from(this.singleCollect.getEntities())[id];
        let isDefault = this.contextHelper.isDefaultExport(path);
        let isDefine = this.contextHelper.isDefineExport(path);
        if(entity instanceof ClassEntity){
            // @ts-ignore
            this.processDefineExport(parentId,id,name,isDefault,isDefine);
        }else if(entity instanceof FunctionEntity){
            // @ts-ignore
            this.processDefineExport(parentId,id,name,isDefault,isDefine);
        }
    }

    /**
     * process the file as a module,
     * and save into ModuleEntity.
     * its parent is a package or none. after finishing all files, we should set the parentId for each module
     * save into singleCollect.entities.
     */
    processModule(fileFullPath:string,packageIndex:number) {
        //let mod2Id = this.saveUnknownModule();
        let parentPkgObj;
        let qualifiedName;
        let onlyModuleName;
        let moduleId = this.singleCollect.getCurrentIndex();
        //let onlyModuleName = PathUtil.deleteLastStrByDot(PathUtil.getLastStrByPathDelimiter(fileFullPath));
        if(fileFullPath.includes("\\")){
            onlyModuleName = PathUtil.getLastStrByPathDelimiter(fileFullPath);
        }else{
            onlyModuleName = fileFullPath;
        }
        //let onlyModuleName = PathUtil.getLastStrByPathDelimiter(fileFullPath);
        //add package's children id if package exists
        if (packageIndex != -1 && packageIndex != -2) {
            parentPkgObj = (Array.from(this.singleCollect.getEntities()))[packageIndex];
            // @ts-ignore
            parentPkgObj.addChildId(moduleId);
            //无js结尾
            // qualifiedName = parentPkgObj.getQualifiedName() + "." +PathUtil.deleteLastStrByDot(onlyModuleName);
            //.js结尾
            qualifiedName = parentPkgObj.getQualifiedName() + "." + onlyModuleName;
        }else if(packageIndex == -2){
            qualifiedName = onlyModuleName;
        }
        // if(mod2Id.has(onlyModuleName)){
        //    return mod2Id.get(onlyModuleName);
        // }
        let moduleEn = new ModuleEntity(moduleId, fileFullPath);
        moduleEn.setParentId(packageIndex);
        moduleEn.setSimpleName(onlyModuleName);
        //moduleEn.setQualifiedName(parentPkgObj.getQualifiedName() + "." +PathUtil.deleteLastStrByDot(onlyModuleName));
        // @ts-ignore
        moduleEn.setQualifiedName(qualifiedName);
        this.singleCollect.addEntity(moduleEn);
        return moduleId;
    }

    saveUnknownModule(){
        let modToId = new Map<string,number>();
        for(let entity of this.singleCollect.getEntities()){
            if(entity instanceof ModuleEntity){
                if(entity.getParentId() == -2){
                    modToId.set(entity.getSimpleName(),entity.getId());
                }
            }
        }
        return modToId;
    }

    /**
     * save classEntity
     * @param parentId:  moduleId or the nested blockId
     * @param className
     * @param baseStrs
     * @return
     */
    processClass(parentId:number, className:string,codeSnippet:string,loc:string, baseStr:string,kind:string) {
        let classId = this.singleCollect.getCurrentIndex();
        let parentObj = (Array.from(this.singleCollect.getEntities()))[parentId];
        let classQualifiedName = parentObj.getQualifiedName() + "." + className;
        if(parentObj instanceof ModuleEntity){
            if(className == "module.exports"){
                className = "exports";
            }
        }else{
            className = parentObj.getSimpleName() + "." +className;
        }
        let classEntity = new ClassEntity(classId, className,classQualifiedName,parentId);
        classEntity.setParentId(parentId);
        classEntity.setCodeSnippet(codeSnippet);
        classEntity.setLoc(loc);
        classEntity.setKind(kind);
        classEntity.addBaseClassName(baseStr);
        classEntity.setSuperClass(baseStr)
        this.singleCollect.addEntity(classEntity);
        parentObj.addChildId(classId);
        return classId;
    }

    /**
     * process the classMethod and save it into methodEntity
     * its parent is a class
     * eg. class A { B() }, var A=class{ B()}
     */
    processClassMethod(parentId:number,methodName:string,codeSnippet:string,loc:string,flag:boolean,cons:boolean){
        let methodId = this.singleCollect.getCurrentIndex();
        let parentObj = (Array.from(this.singleCollect.getEntities()))[parentId];
        let methodQualifiedName = parentObj.getQualifiedName() + "." + methodName;
        methodName = parentObj.getSimpleName() + "." + methodName;
        let methodEntity = new MethodEntity(methodId, methodName);
        if(flag){
            methodEntity.setStatic(flag);
        }
        if(cons) {
            methodEntity.setConstructor(cons);
            if(parentObj instanceof ClassEntity) {
                methodEntity.setInferType(parentObj.getSimpleName())
                if(parentObj.getSuperClass() !== "") {
                    methodEntity.setInferType(parentObj.getSuperClass())
                }
            }
        }
        methodEntity.setQualifiedName(methodQualifiedName);
        methodEntity.setParentId(parentId);
        methodEntity.setCodeSnippet(codeSnippet);
        methodEntity.setLoc(loc);
        parentObj.addChildId(methodId);
        this.singleCollect.addEntity(methodEntity);
        return methodId;
    }


    processFunction(parentId:number,funcName:string,codeSnippet:string,loc:string,generator:boolean,async:boolean){
        let functionId = this.singleCollect.getCurrentIndex();
        let parentObj = (Array.from(this.singleCollect.getEntities()))[parentId];
        let funcQualifiedName = parentObj.getQualifiedName() + "." + funcName;
        let astName = funcName;
        let topFunc = true;
        if(!(parentObj instanceof ModuleEntity)) {
            topFunc = false;
            funcName = parentObj.getSimpleName() + "." +funcName;
        }
        // if(parentObj instanceof FunctionEntity && funcName.startsWith("unnamed_function_")){
        //     topFunc = true;
        // }
        let functionEntity = new FunctionEntity(functionId, funcName, funcQualifiedName);
        functionEntity.setPureName(astName)
        functionEntity.setParentId(parentId);
        functionEntity.setCodeSnippet(codeSnippet);
        functionEntity.setLoc(loc);
        functionEntity.setGenerator(generator);
        functionEntity.setAsync(async);
        // functionEntity.setTopFunc(topFunc)
        //判断语法树上获取的原始函数名是否为大写字母开头，若是，则classType为“UpperNaming”
        if(astName.slice(0,1) >= 'A' && astName.slice(0,1) <= 'Z') {
            if(!(functionEntity.getClassType().includes("UpperNaming"))) {
                functionEntity.setClassType("UpperNaming");
                // console.log(functionEntity)
            }
        }
        this.singleCollect.addEntity(functionEntity);
        parentObj.addChildId(functionId);
        return functionId;
    }

    processVar(parentId:number,varName:string,type:string,codeSnippet:string,loc:string,kind:string,isDefineExported:boolean,isLeftAssign:boolean,isModify:boolean):number{
        let parentObj;
        let varQualifiedName:any;
        let originName = varName;
        let varId = this.singleCollect.getCurrentIndex();
        // console.log(varId)
        parentObj = (Array.from(this.singleCollect.getEntities()))[parentId];
        if(parentObj !== undefined){
            varQualifiedName = parentObj.getQualifiedName() + "." + varName;
        }

        // console.log(varId + "/////////" + varName)
        if(parentObj instanceof FunctionEntity || parentObj instanceof MethodEntity || parentObj instanceof ModuleEntity){
            varName = parentObj.getSimpleName() + "." + varName;
        }
        if(this.findRepeatedGloOrLocVar(originName,varName,parentId,isLeftAssign,isModify) !== -1){
            //在这个里面找到重复的变量了，去processLocOrGloName,把重复的保存起来，然后在这里跳出
            return parentId;
        }
        if(isDefineExported){
            parentObj.addDefineExportId2Str(varId,varName);
        }
        let variableEntity = new VarEntity(varId, varName, type);
        if(parentObj instanceof FunctionEntity || parentObj instanceof MethodEntity || parentObj instanceof ModuleEntity){
            parentObj.addName2Usage(originName + "_id_" + varId.toString(),"");
        }
        variableEntity.setQualifiedName(varQualifiedName);
        variableEntity.setParentId(parentId);
        variableEntity.setCodeSnippet(codeSnippet);
        variableEntity.setLoc(loc);
        variableEntity.setKind(kind);
        if(originName == "this" || originName == "super") {
            if(parentObj instanceof MethodEntity && parentObj.getConstructor()){
                if(parentObj.getInferType().length > 0) {
                    parentObj.getInferType().forEach(item => {
                        variableEntity.setInferType(item)
                    })
                }
            }
        }
        this.singleCollect.addEntity(variableEntity);
        parentObj.addChildId(varId);
        return varId;
    }

    /**
     * judge the str (x) is already a globalOrLocVar or not?
     */
    findRepeatedGloOrLocVar(pureName:string,str:string, modOrFuncOrMethodId:number,isLeftAssign:boolean,isModify:boolean) {
        if(modOrFuncOrMethodId == -1) {
            return -1;
        }
        let modOrFuncOrMethodObj = (Array.from(this.singleCollect.getEntities()))[modOrFuncOrMethodId];
        if(modOrFuncOrMethodObj !== undefined){
            while(!(modOrFuncOrMethodObj instanceof ModuleEntity || modOrFuncOrMethodObj instanceof FunctionEntity
                || modOrFuncOrMethodObj instanceof MethodEntity)) {
                modOrFuncOrMethodId = modOrFuncOrMethodObj.getParentId();
                modOrFuncOrMethodObj = (Array.from(this.singleCollect.getEntities()))[modOrFuncOrMethodId];
                //return false;
            }
            for (let childId of modOrFuncOrMethodObj.getChildrenIds()) {
                let childObj = (Array.from(this.singleCollect.getEntities()))[childId];
                if(childObj instanceof VarEntity || childObj instanceof ParameterEntity
                    || childObj instanceof PropertyEntity) {
                    if(childObj.getSimpleName() == str) {
                        //说明是个重复的var,在这里处理一下这个var
                        //console.log(str)
                        this.processLocOrGloName(modOrFuncOrMethodId,pureName,isLeftAssign,isModify);
                        return childId;
                    }
                }
            }
            this.processLocOrGloName(modOrFuncOrMethodId,pureName,isLeftAssign,isModify);
            return -1;
        }
    }

    processParameter(parentId:number,paraName:string,isLeftAssign:boolean,isModify:boolean){
        let paraId = this.singleCollect.getCurrentIndex();
        let originName = paraName;
        let parentObj = (Array.from(this.singleCollect.getEntities()))[parentId];
        if(parentObj !== undefined){
            let paraQualifiedName = parentObj.getQualifiedName() + "." + paraName;
            let pureParaName = paraName;
            if(!(parentObj instanceof ModuleEntity)){
                paraName = parentObj.getSimpleName() + "." + paraName;
            }
            if(this.findRepeatedPara(originName,paraName,parentId,isLeftAssign,isModify) !== -1){
                return parentId;
            }

            let paraEntity = new ParameterEntity(paraId,paraName);
            if(parentObj instanceof FunctionEntity || parentObj instanceof MethodEntity || parentObj instanceof ModuleEntity){
                parentObj.addName2Usage(originName + "_id_" + paraId.toString(),"");
            }
            paraEntity.setQualifiedName(paraQualifiedName);
            paraEntity.setParentId(parentId);
            parentObj.addChildId(paraId);

            if(parentObj instanceof FunctionEntity || parentObj instanceof MethodEntity){
                parentObj.initParameters(paraId, pureParaName, paraName, [])
            }
            this.singleCollect.addEntity(paraEntity);
            return paraId;
        }
    }

    mapToObj(map:Map<string,number>){
        let obj= Object.create(null);
        map.forEach(function (value, key, map){
            obj[key] = value;
        })
        return obj;
    }

    /**
     * judge the str (x) is already a para or not?
     */
    findRepeatedPara(pureName:string,str:string, parentId:number,isLeftAssign:boolean,isModify:boolean) {
        if(parentId == -1) {
            return -1;
        }
        let parentObj = (Array.from(this.singleCollect.getEntities()))[parentId];
        if(!(parentObj instanceof FunctionEntity || parentObj instanceof ClassEntity
            || parentObj instanceof MethodEntity || parentObj instanceof ModuleEntity)) {
            return -1;
        }
        for (let childId of parentObj.getChildrenIds()) {
            let childObj = (Array.from(this.singleCollect.getEntities()))[childId];
            if(childObj instanceof ParameterEntity || childObj instanceof VarEntity
            || childObj instanceof PropertyEntity || childObj instanceof ClassEntity
            || childObj instanceof FunctionEntity || childObj instanceof MethodEntity) {
                if(childObj.getSimpleName() == str) {
                    //console.log(str)
                    this.processLocOrGloName(parentId,pureName,isLeftAssign,isModify);
                    return childId;
                }
           }
        }
        this.processLocOrGloName(parentId,pureName,isLeftAssign,isModify);
        return -1;
    }

    processProperty(parentId:number,propName:string,loc:string,isLeftAssign:boolean,isModify:boolean,isStatic:boolean){
        let propQualifiedName;
        let originPropName = propName;
        let propId = this.singleCollect.getCurrentIndex();
        let parentObj = (Array.from(this.singleCollect.getEntities()))[parentId];
        if(parentObj !== undefined){
            propQualifiedName = parentObj.getQualifiedName() + "." + propName;
            if(parentObj instanceof ModuleEntity){
                if(propName == "module.exports"){
                    propName = "exports";
                }
            }else{
                propName = parentObj.getSimpleName() + "." + propName;
            }
            if(this.findRepeatedProp(originPropName,propName,parentId,isLeftAssign,isModify) !== -1){
                this.processLocOrGloName(parentId,originPropName,isLeftAssign,isModify);
                return parentId;
            }
            parentObj.addChildId(propId);
        }
        let propEntity = new PropertyEntity(propId,propName);
        if(parentObj instanceof FunctionEntity || parentObj instanceof MethodEntity || parentObj instanceof ModuleEntity){
            parentObj.addName2Usage(originPropName + "_id_" + propId.toString(),"");
        }
        // @ts-ignore
        propEntity.setQualifiedName(propQualifiedName);
        propEntity.setParentId(parentId);
        propEntity.setLoc(loc);
        propEntity.setStatic(isStatic);
        if(parentObj instanceof FunctionEntity || parentObj instanceof MethodEntity){
            parentObj.initParameters(propId, originPropName, propName, [])
        }
        this.singleCollect.addEntity(propEntity);
        return propId;
    }

    /**
     * judge the str (x) is already a prop or not?
     */
    findRepeatedProp(pureName:string,str:string, parentId:number,isLeftAssign:boolean,isModify:boolean) {
        if(parentId == -1) {
            return -1;
        }
        let parentObj = (Array.from(this.singleCollect.getEntities()))[parentId];
        if(!(parentObj instanceof FunctionEntity || parentObj instanceof ClassEntity
            || parentObj instanceof MethodEntity || parentObj instanceof ModuleEntity)) {
            return -1;
        }
        for (let childId of parentObj.getChildrenIds()) {
            let childObj = (Array.from(this.singleCollect.getEntities()))[childId];
            if(childObj instanceof PropertyEntity || childObj instanceof VarEntity
                || childObj instanceof ParameterEntity || parentObj instanceof FunctionEntity || parentObj instanceof ClassEntity
                || parentObj instanceof MethodEntity) {
                if(childObj.getSimpleName() == str) {
                    return childId;
                }
            }
        }
        this.processLocOrGloName(parentId,pureName,isLeftAssign,isModify);
        return -1;
    }


    processLocOrGloName(parentId:number,str:string,isLeftAssign:boolean,isModify:boolean){
        let usage = "use";  //default
        if(isLeftAssign){
            usage = "set";
        }
        if(isModify == true){
            usage = "modify";
        }
        if(str !== undefined && str !== ""){
            if(!(str.includes("(") && str.includes(")"))){
                if(str.includes(".")){
                    //x.y
                    //console.log(modOrFuncOrMethodId+",,"+str+",,"+usage)
                    this.processNameWithDot(parentId,  str, usage);
                }else if(!(str.includes("."))){
                    //x
                    //console.log(modOrFuncOrMethodId+",,"+str+",,"+usage)
                    this.processNameWithoutDot(parentId,  str, usage);
                }
            }else{
                if(str.includes(".")){
                    //y().x
                    this.processNameWithDot(parentId,  str, usage);
                }
            }
        }
    }

    processNameWithDot(parentId:number, str:string, usage:string) {
        let nameIndex = -1;
        let parentObj = (Array.from(this.singleCollect.getEntities()))[parentId];
        if(parentObj instanceof ModuleEntity) {
            this.processNameInModule(parentId, str, usage);
            //console.log(parentObj.getLocalNames())
        }
        else if (parentObj instanceof FunctionEntity) {
            this.processNameInFunction(parentId, str, usage);
            //console.log(parentObj.getLocalNames())
        }
        else if (parentObj instanceof MethodEntity) {
            this.processNameInMethod(parentId, str, usage);
        }
        else if (parentObj instanceof VarEntity) {
            this.processNameInVar(parentId, str, usage);
            //console.log(parentObj.getLocalNames())
        }
        return nameIndex;
    }

    processNameWithoutDot(parentId:number, str:string, usage:string){
        //console.log(parentId+"///////"+str+"/////"+usage)
        let nameIndex = -1;
        //maybe duplicated, check if exist.
        let parentObj = (Array.from(this.singleCollect.getEntities()))[parentId];
        if(parentObj instanceof ModuleEntity) {
            this.processNameInModule(parentId, str, usage);
            //console.log(parentObj.getLocalNames())
        }
        else if (parentObj instanceof FunctionEntity) {
            this.processNameInFunction(parentId, str, usage);
            //console.log(parentObj.getLocalNames())
        }
        else if (parentObj instanceof MethodEntity) {
            this.processNameInMethod(parentId, str, usage);
        }
        else if (parentObj instanceof VarEntity) {
            this.processNameInVar(parentId, str, usage);
        }
        return nameIndex;
    }

    processNameInModule(moduleId:number, name:string, usage:string) {
        let localNameIndex = this.getLocalNameId(moduleId, name);
        let modObj = (Array.from(this.singleCollect.getEntities()))[moduleId];
        if(localNameIndex != -1) { //exist
            let localNameObj = (Array.from(modObj.getLocalNames()))[localNameIndex];
            // @ts-ignore
            localNameObj.updateUsage(usage)
            // @ts-ignore
            localNameObj.updateWeighedUsage(usage);
        }
        else { //not exist
            localNameIndex = modObj.getLocalNames().size;
            let localName = new LocalName(name, "" );
            localName.updateWeighedUsage(usage);
            localName.updateUsage(usage);
            modObj.addLocalName(localName);
        }
        return localNameIndex;
    }

    processNameInFunction(functionId:number, name:string, usage:string) {
        //console.log(functionId+"///////"+name+"/////"+usage)
        let localNameIndex = this.getLocalNameId(functionId, name);
        let funcObj = (Array.from(this.singleCollect.getEntities()))[functionId];
        if(localNameIndex != -1) { //exist
            let localNameObj = (Array.from(funcObj.getLocalNames()))[localNameIndex];
            // @ts-ignore
            localNameObj.updateUsage(usage)
            // @ts-ignore
            localNameObj.updateWeighedUsage(usage);
        }
        else { //not exist
            localNameIndex = funcObj.getLocalNames().size;
            let localName = new LocalName(name, "");
            localName.updateWeighedUsage(usage);
            localName.updateUsage(usage);
            funcObj.addLocalName(localName);
        }
        return localNameIndex;
    }

    processNameInMethod(methodId:number, name:string, usage:string) {
        let localNameIndex = this.getLocalNameId(methodId, name);
        let methodObj = (Array.from(this.singleCollect.getEntities()))[methodId];
        if(localNameIndex != -1) { //exist
            let localNameObj = (Array.from(methodObj.getLocalNames()))[localNameIndex];
            // @ts-ignore
            localNameObj.updateUsage(usage)
            // @ts-ignore
            localNameObj.updateWeighedUsage(usage);
        }
        else { //not exist
            localNameIndex = methodObj.getLocalNames().size;
            let localName = new LocalName(name, "");
            localName.updateWeighedUsage(usage);
            localName.updateUsage(usage);
            methodObj.addLocalName(localName);
        }
        return localNameIndex;
    }

    processNameInVar(varId:number, name:string, usage:string) {
        let localNameIndex = this.getLocalNameId(varId, name);
        let methodObj = (Array.from(this.singleCollect.getEntities()))[varId];
        if(localNameIndex != -1) { //exist
            let localNameObj = (Array.from(methodObj.getLocalNames()))[localNameIndex];
            // @ts-ignore
            localNameObj.updateUsage(usage)
            // @ts-ignore
            localNameObj.updateWeighedUsage(usage);
        }
        else { //not exist
            localNameIndex = methodObj.getLocalNames().size;
            let localName = new LocalName(name, "");
            localName.updateWeighedUsage(usage);
            localName.updateUsage(usage);
            methodObj.addLocalName(localName);
        }
        return localNameIndex;
    }

    getLocalNameId(parentId:number, name:string) {
        let parentObj = (Array.from(this.singleCollect.getEntities()))[parentId];
        let localNames = null;

        if(parentObj instanceof ModuleEntity || parentObj instanceof FunctionEntity
        || parentObj instanceof MethodEntity || parentObj instanceof VarEntity) {
            localNames = parentObj.getLocalNames();
        }
        if(localNames == null) {
            return -1;
        }

        for (let index = 0; index < localNames.size; index ++) {
            let localName = (Array.from(localNames))[index];
            if(localName.getName() == name) {
                return index;
            }
        }
        return -1;
    }

    processObjectMethod(parentId:number,propName:string,loc:string,generator:boolean,async:boolean){
        let methodId = this.singleCollect.getCurrentIndex();
        let parentObj = (Array.from(this.singleCollect.getEntities()))[parentId];
        let methodName = parentObj.getSimpleName() + "." + propName;
        let astName = propName;
        if(parentObj instanceof ModuleEntity){
            methodName = propName;
            if(propName == "module.exports"){
                methodName = "exports";
            }
        }
        let methodQualifiedName = parentObj.getQualifiedName() + "." + propName;
        let methodEntity = new MethodEntity(methodId, methodName);
        methodEntity.setQualifiedName(methodQualifiedName);
        methodEntity.setParentId(parentId);
        methodEntity.setLoc(loc);
        methodEntity.setGenerator(generator);
        methodEntity.setAsync(async);
        if(astName) {
            if(astName.slice(0,1) >= 'A' && astName.slice(0,1) <= 'Z') {
                if(!(methodEntity.getClassType().includes("UpperNaming"))) {
                    methodEntity.setClassType("UpperNaming");
                    // console.log(functionEntity)
                }
            }
        }
        parentObj.addChildId(methodId);
        this.singleCollect.addEntity(methodEntity);
        return methodId;
    }

    processCallee(parentId:number,calleeStr:string){
        let flag = "call";
        let parentObj = (Array.from(this.singleCollect.getEntities()))[parentId];
        if(parentObj instanceof VarEntity || parentObj instanceof PropertyEntity){
            parentId = parentObj.getParentId();
            parentObj = (Array.from(this.singleCollect.getEntities()))[parentId];
            while(parentObj !== undefined && !(parentObj instanceof FunctionEntity || parentObj instanceof MethodEntity
                || parentObj instanceof ModuleEntity)){
                parentId = parentObj.getParentId();
                parentObj = (Array.from(this.singleCollect.getEntities()))[parentId];
            }
        }
        // console.log(calleeStr)
        if(calleeStr.startsWith("new ")){
            flag = "callNew"
        }
        if(parentObj instanceof ModuleEntity){
            if(flag == "call"){
                parentObj.addFuncOrClsCall(calleeStr);
            }else if(flag == "callNew"){
                // parentObj.addCallNewFunc(calleeStr.replace("new","").trim());
                calleeStr = this.formalizeCallee(calleeStr)
                parentObj.addCallNewFunc('new ' + calleeStr);
            }
        }
        if(parentObj instanceof FunctionEntity || parentObj instanceof MethodEntity){
            if(flag == "call"){
                parentObj.addCalledFuncOrCls(calleeStr);
            }else if(flag == "callNew"){
                calleeStr = this.formalizeCallee(calleeStr)
                parentObj.addCallNewFunc('new ' + calleeStr);
            }
        }
      return calleeStr;
    }

    formalizeCallee(calleeStr:string){
        let callee = calleeStr.replace("new","").trim();
        if(callee.endsWith(")")) {
            //P(),  utils_1.AbiDecoder(),  utils_1.BigNumber().pow()
            callee = callee.split("(")[0];
            if(callee.includes("_1.")){
                callee = callee.split("_1.")[1];
            }
        }
        if(callee.includes("_1.") && callee.includes("(") && callee.includes(")")){
            callee = callee.split("_1.")[1];
            callee = callee.split("(")[0];
        }
        if(callee.endsWith(".")){
            callee = callee.substring(0,callee.length - 1);
        }
        return callee;
    }

    formalizeStr(str:string){
        if(str.endsWith(".")){
            str = str.substring(0,str.length - 1);
        }
        if(str.startsWith("new ")){
            str = str.substring(4,str.length);
        }
        // if(str.startsWith("new new ")){
        //     str = str.substring(8,str.length);
        // }
        return str;
    }

    saveImportsInModule(importStmts:Set<ImportStmt>,parentId:number){
        let parentObj = (Array.from(this.singleCollect.getEntities()))[parentId];
        if(parentObj instanceof ModuleEntity){
            parentObj.addImportStmts(importStmts);
        }
    }

    processPossiblePointer(str:string,parentId:number){
        let parentObj = (Array.from(this.singleCollect.getEntities()))[parentId];
        if(parentObj instanceof FunctionEntity){
            parentObj.addPossiblePointer(str);
        }
    }

    processDefineExport(parentId:number,exportedId:number,exportedStr:string,isDefault:boolean,isDefine:boolean){
        let parentObj = (Array.from(this.singleCollect.getEntities()))[parentId];
        if(parentObj instanceof ModuleEntity){
            if(isDefault == true){
                parentObj.addDefineDefaultExportId2Str(exportedId,exportedStr);
            }
            if(isDefine == true){
                parentObj.addDefineExportId2Str(exportedId,exportedStr);
            }
        }
    }

    findExportId(name:string,parentId:number) {
        let exportId = -1;
        let parentObj = Array.from(this.singleCollect.getEntities())[parentId];
        for(let childId of parentObj.getChildrenIds()){
            let childObj = Array.from(this.singleCollect.getEntities())[childId];
            if(childObj instanceof FunctionEntity || childObj instanceof ClassEntity || childObj instanceof VarEntity){
                let childName = childObj.getSimpleName();
                if(childName == name) {
                    exportId = childObj.getId();
                }
            }
        }
        return exportId;
    }

    processDeclareExport(parentId:number,exportedStr:string,exportId:number,isDefault:boolean){
        let parentObj = (Array.from(this.singleCollect.getEntities()))[parentId];
        if(exportId !== -1) {
            if(parentObj instanceof ModuleEntity){
                if(isDefault){
                    //parentObj.addDeclareExportDefaultStr(exportedStr);
                    parentObj.addDeclareExportDefaultId2Str(exportId,exportedStr);
                }else{
                    //parentObj.addDeclareExportStr(exportedStr);
                    parentObj.addDeclareExportId2Str(exportId,exportedStr);
                }
            }
        } else {
            //未声明导出
        }
    }

    processAlias(ImportOrExportStr: string, id: number, parentId: number,isImportOrExport:boolean){
        let parentObj = (Array.from(this.singleCollect.getEntities()))[parentId];
        if(parentObj instanceof ModuleEntity){
            if(isImportOrExport == false){
                //exported
                parentObj.addExportAlias(ImportOrExportStr,id);
            }else{
                //imported
                parentObj.addImportAlias(ImportOrExportStr,id);
            }

        }
    }

    processCode(codeAndLocMap:Map<string,string>,allEntity:Set<any>){
        let codeSnippet: string | undefined;
        // console.log(codeAndLocMap.get('1129_id_14,8,14,52'))
        for(let entity of allEntity){
            if(entity instanceof ModuleEntity || entity instanceof FunctionEntity || entity instanceof MethodEntity) {
                let funcId = entity.getId()
                codeAndLocMap.forEach((value, key, map) => {
                    if(key.includes(funcId.toString())) {
                        // console.log(funcId.toString())
                        // console.log(key + "////////" + value)
                        if(value.length > 200) {
                            codeSnippet = value.substr(0, 199)
                        } else {
                            codeSnippet = value
                        }
                        // console.log(funcId + "///////////" + value)
                        if(codeSnippet !== undefined) {
                            if(codeSnippet.length <= 200 &&  !(/^[0-9]*$/.test(codeSnippet))) {
                                entity.addCode(codeSnippet)
                                // if(codeSnippet.includes("_constants = ")){
                                //     console.log(funcId + "///////////" + codeSnippet)
                                // }
                                // console.log(funcId + "///////////" + codeSnippet)
                            }
                        }
                    }
                })

            }

            if(entity instanceof FunctionEntity || entity instanceof MethodEntity) {
                if(codeAndLocMap.has(entity.getId() + "_id_" + entity.getLoc())){
                    codeSnippet = codeAndLocMap.get(entity.getId() + "_id_" + entity.getLoc());
                    // @ts-ignore
                    entity.setCodeSnippet(codeSnippet)
                }

                //return语句的loc
                let returnLoc = entity.getReturnLoc();
                returnLoc.forEach(item => {
                    // 每一个return loc,对应一个返回值语句
                    if(codeAndLocMap.has(entity.getId() + "_id_" + item)){
                        // @ts-ignore
                        codeSnippet = codeAndLocMap.get(entity.getId() + "_id_" + item);
                        if(codeSnippet !== undefined) {
                            codeSnippet = this.formatCodeStmt(codeSnippet);
                        }
                        //全局returns没有清空，直接追加到后面了
                        entity.addReturns(codeSnippet);
                    }
                })


                //可能的param语句，拿到func的innerLoc,找到code,放入该func的参数内部的use_seq中
                let possibParamUse = entity.getInnerLoc();
                // console.log(possibParamUse)
                possibParamUse.forEach(item => {
                    if(codeAndLocMap.has(item)){
                        //应该获取到大多数的代码段
                        // @ts-ignore
                        codeSnippet = codeAndLocMap.get(item);
                        //如果codeSnippet包含参数名，就把这段代码保存到param使用序列中
                        //访问名字
                        let params = entity.getParams();
                        // console.log(params)
                        if(params.length > 0) {
                            for(let param of params) {
                                let paramName = param.pureName;
                                //检查code中是否包含参数的使用
                                if(codeSnippet !== undefined) {
                                    if(codeSnippet.includes(paramName)) {
                                        //     codeSnippet = this.formatCodeStmt(codeSnippet);
                                       param.useSeq.push(codeSnippet)
                                    }
                                }

                            }
                        }
                    }
                })
            }

            // + "_id_" + id.toString()
            if(entity instanceof VarEntity || entity instanceof ClassEntity || entity instanceof PropertyEntity){
                let id = entity.getId();
                if(codeAndLocMap.has(entity.getId() + "_id_" + entity.getLoc())){
                    // @ts-ignore
                    codeSnippet = codeAndLocMap.get(entity.getId() + "_id_" + entity.getLoc());
                    if(entity instanceof VarEntity && codeSnippet !== undefined) {
                        let parentObj = Array.from(allEntity)[entity.getParentId()];
                        if(parentObj instanceof FunctionEntity || parentObj instanceof MethodEntity || parentObj instanceof ModuleEntity) {
                            //给对应的map键值var添加usage（def）
                            let nameArr = entity.getSimpleName().split(".");
                            parentObj.addName2Usage(nameArr[nameArr.length-1] + "_id_" + id.toString(), codeSnippet);
                        }
                    }
                    // @ts-ignore
                    entity.setCodeSnippet(codeSnippet)
                }
            }
        }
    }

    formatCodeStmt(returnStmt:string){
        //无论语句是什么格式，应该处理的规范容易识别

        //含有return，处理一下格式
        if(returnStmt !== undefined) {
            if(returnStmt.includes("return")) {
                returnStmt = returnStmt.replace("return", "").trim();
            }
            if(returnStmt.includes(";")) {
                returnStmt = returnStmt.replace(";", "").trim();
            }
        }
        return returnStmt;
    }

    //save all return stmt in function or method
    saveReturnLoc4Func(loc:string, parentId:number) {
        let parentObj = [...this.singleCollect.getEntities()][parentId];
        if(parentObj instanceof FunctionEntity || parentObj instanceof MethodEntity) {
            if(!(parentObj.getReturnLoc().includes(loc))) {
                parentObj.addReturnLoc(loc);
            }
        }
    }

    //save all stmt in function or method
    saveInnerLoc4Func(loc:string, parentId:number) {
        let parentObj = [...this.singleCollect.getEntities()][parentId];
        if(parentObj instanceof FunctionEntity || parentObj instanceof MethodEntity) {
            if(!(parentObj.getInnerLoc().includes(parentId + "_id_" + loc))) {
                parentObj.addInnerLoc(parentId + "_id_" + loc);
            }
        }
    }

    processPredefinedObject(name: string,parentId:number) {
        let objId = this.singleCollect.getCurrentIndex();
        let predefinedObj = new PredefinedObjectEntity(objId,name);
        predefinedObj.setSimpleName(name);
        predefinedObj.setParentId(parentId);
        if(this.findRepeatPredefinedObject(name) !== -1){
            return this.findRepeatPredefinedObject(name);
        }else{
            this.singleCollect.addEntity(predefinedObj);
            return objId;
        }
    }

    findRepeatPredefinedObject(name:string){
        for(let entity of this.singleCollect.getEntities()){
            if(entity instanceof PredefinedObjectEntity){
                if(name == entity.getSimpleName()){
                    return entity.getId();
                }
            }
        }
        return -1;
    }

    isThisBinding(parentObj:any) {
        if(parentObj instanceof FunctionEntity || parentObj instanceof MethodEntity) {
            // parentObj.setThisBinding(true);
            parentObj.setClassType("ThisBinding");
        }
    }

    processPrototype(name:string,parentObj:any) {
        if(parentObj instanceof ModuleEntity || parentObj instanceof FunctionEntity || parentObj instanceof MethodEntity) {
            parentObj.addProtoDefined(name);
        }
    }

    processInstanceOf(name:string,parentId:number) {
        if(name && /^[A-Z]/.test(name)) {
            let parentObj = [...this.singleCollect.getEntities()][parentId];
            while(!(parentObj instanceof ModuleEntity || parentObj instanceof FunctionEntity
                || parentObj instanceof MethodEntity)) {
                parentId = parentObj.getParentId();
                parentObj = [...this.singleCollect.getEntities()][parentId];
            }
            if(parentObj instanceof ModuleEntity || parentObj instanceof MethodEntity
                || parentObj instanceof FunctionEntity) {
                name = "instance_" + name;
                parentObj.addInstanceNames(name);
            }
        }
    }

    processCall_ApplyFunc(calleStr:string, parentId:number) {
        let parentObj = [...this.singleCollect.getEntities()][parentId];
        if(parentObj instanceof FunctionEntity || parentObj instanceof MethodEntity) {
            parentObj.addCallApply(calleStr);
        }
    }

    save_infer_type(inferId:any, type:string) {
        let inferObj = [...this.singleCollect.getEntities()][inferId];
        type = this.processInferType(type);
        inferObj.setInferType(type);
    }

    processInferType(type:string) {
        if(type.startsWith("new ") && type.includes("(") ){
            type = type.split("(")[0]
        }
        return type;
    }
}
export default ProcessEntity;