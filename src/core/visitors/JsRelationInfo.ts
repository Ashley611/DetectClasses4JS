import PackageEntity from "../entities/PackageEntity";
import ModuleEntity from "../entities/ModuleEntity";
import FunctionEntity from "../entities/FunctionEntity";
import ClassEntity from "../entities/ClassEntity";
import MethodEntity from "../entities/MethodEntity";
import VarEntity from "../entities/VarEntity";
import ParameterEntity from "../entities/ParameterEntity";
import PropertyEntity from "../entities/PropertyEntity";
import Configure from "../utils/Configure";
import SingleCollect from "../utils/SingleCollect";
import RelationTuple from "../utils/RelationTuple";


class JsRelationInfo{

    singleCollect = SingleCollect.getSingleCollectInstance();
    private deps = new Set<RelationTuple<string, string>>();
    entityNum = new Set();
    private Package = 0;
    private Module = 0;
    private Function = 0;
    private Class = 0;
    private Method = 0;
    private Variable = 0;
    private Parameter = 0;
    private Property = 0;


    setPackageNum(num:number) {
        this.Package = num;
    }

    setModuleNum(num:number) {
        this.Method = num;
    }
    setFunctionNum(num:number) {
        this.Function = num;
    }
    setClassNum(num:number) {
        this.Class = num;
    }
    setMethodNum(num:number) {
        this.Method = num;
    }

    setVariableNum(num:number) {
        this.Variable = num;
    }
    setParameterNum(num:number) {
        this.Parameter = num;
    }
    setPropertyNum(num:number) {
        this.Property = num;
    }


    entityStatis() {
        let packageCount = 0;
        let fileCount = 0;
        let classCount = 0;
        let functionCount = 0;
        let topFuncCount = 0;
        let methodCount = 0;
        let varCount = 0;
        let paraCount = 0;
        let propCount = 0;
        let numsObject = new Map<string,number>();

        for(let entity of this.singleCollect.getEntities()) {
            if(entity instanceof PackageEntity) {
                packageCount ++;
            } else if(entity instanceof ModuleEntity) {
                if(entity.getParentId() !== -2){
                    fileCount ++;
                }
            } else if(entity instanceof FunctionEntity) {
                functionCount ++;
                // if(entity.getTopFunc()){
                //     topFuncCount ++;
                // }
            } else if(entity instanceof MethodEntity) {
                if(entity.getSimpleName().startsWith("UnresolvedMethod_")
                || entity.getSimpleName().includes("UnresolvedMethod_")){
                    continue;
                }else{
                    methodCount ++;
                }
            } else if(entity instanceof ClassEntity) {
                classCount ++;
            }else if(entity instanceof VarEntity){
                varCount++;
            } else if(entity instanceof ParameterEntity){
                paraCount++;
            } else if(entity instanceof PropertyEntity){
                propCount++;
            }
        }
        let totalNum = fileCount+classCount+functionCount+methodCount
            +varCount+paraCount+propCount;

        // this.setPackageNum(packageCount);
        // this.setModuleNum(fileCount);
        // this.setFunctionNum(functionCount);
        // this.setClassNum(classCount);
        // this.setMethodNum(methodCount);
        // this.setVariableNum(varCount);
        // this.setParameterNum(paraCount);
        // this.setPropertyNum(propCount);

        //在这里返回数据，在MapObject里
        let str = "";
        str += ("Package:      " + packageCount + "\n");
        str += ("Module:       " + fileCount + "\n");
        str += ("Class:        " + classCount + "\n");
        str += ("Function:     " + functionCount + "\n");
        str += ("Method:       " + methodCount + "\n");
        str += ("Variable:     " + varCount + "\n");
        str += ("Parameter:    " + paraCount + "\n");
        str += ("Property:     " + propCount + "\n");
        str += ("totalNum:     " + totalNum + "\n");
        console.log(str)

        numsObject.set("Package",packageCount);
        numsObject.set("Module",fileCount);
        numsObject.set("Class",classCount);
        numsObject.set("Function",functionCount);
        numsObject.set("Method",methodCount);
        numsObject.set("Variable",varCount);
        numsObject.set("Parameter",paraCount);
        numsObject.set("Property",propCount);
        //return str;
        return numsObject
    }

    classTypeStatis() {
        let userDefinedNum = 0;
        let totalFuncNum = 0;
        let normalFuncNum = 0;
        let upperNamingNum = 0;
        let instantiatedNum = 0;
        let instantiatedArr = [0,0];
        let instantiatedClass = new Set<string>();
        let isInstanceofNum = 0;
        let isInstanceofArr = [0,0];
        let isInstanceofClass = new Set<string>();
        let protoDefinedNum = 0;
        let protoDefinedArr = [0,0];
        let protoDefinedClass = new Set<string>();
        let thisBindingNum = 0;
        let call_applyExtendNum = 0;
        let call_applyExtendArr = [0,0];
        let call_applyExtendClass = new Set<string>();
        let userDefinedPer = "0";
        let upperPer = "0";
        let instantiatedNumPer = "0";
        let isInstanceOfPer = "0";
        let thisBindingPer = "0";
        let protoPer = "0";
        let call_applyPer = "0";
        let obj = new Map();
        let res = new Array<Object>();
        let userDefinedTypes = new Set<string>();
        let construtorFunc = new Array<string>();
        let tempThisBindingArr = new Array<string>();
        let thisBindingArr = new Array<string>();
        let likely_unresolved_func = 0;


        for(let entity of this.singleCollect.getEntities()) {
            if(entity instanceof ModuleEntity || entity instanceof FunctionEntity || entity instanceof MethodEntity){
                //获取protoDefined数组，其中的内容也可能为class
                //protodefined使用的次数，无需去重, 在函数处理时顺便保存了其名字
                protoDefinedArr = this.getProtoNum(entity, userDefinedTypes, protoDefinedArr, protoDefinedClass);
                if(entity instanceof FunctionEntity || entity instanceof MethodEntity) {
                    if(entity instanceof FunctionEntity){
                        totalFuncNum++;
                    }
                    //thisbinding
                    let classTypeArr = entity.getClassType();
                    if(classTypeArr.includes("UpperNaming") && classTypeArr.includes("ThisBinding")){
                        let funcName = entity.getPureName();
                        thisBindingNum ++;
                        this.addUserTypes(funcName, userDefinedTypes, 'other');
                    }
                    //isInstanceof使用的次数
                    isInstanceofArr = this.getInstanceNum(entity, userDefinedTypes, isInstanceofArr, isInstanceofClass);
                    //call_apply使用的次数
                    call_applyExtendArr = this.getCallApplyNum(entity, userDefinedTypes, call_applyExtendArr, call_applyExtendClass);
                }
                if(entity instanceof ModuleEntity) {
                    let instanceSet = entity.getInstanceNames();
                    if(instanceSet.size > 0){
                        isInstanceofArr[0]++;
                    }
                }
            }

            if(entity instanceof VarEntity || entity instanceof PropertyEntity){
                //实例化行为的次数，可能一个函数会实例化多次
                instantiatedArr = this.getInstantiatedNum(entity, userDefinedTypes, instantiatedArr, instantiatedClass);
            //     likely_unresolved_func = instantiatedNum + isInstanceofNum;
            }
            if(entity instanceof FunctionEntity || entity instanceof MethodEntity || entity instanceof ModuleEntity){
                instantiatedArr = this.getInstantiatedNum(entity, userDefinedTypes, instantiatedArr, instantiatedClass);
            }
            // console.log(userDefinedTypes)
        }


        // totalFuncNum += likely_unresolved_func;
        //function直接定义的一部分，还有一些找不到定义的一些class(它们的构造函数方法实例化了)
        // thisBindingNum += userDefinedTypes.size;
        userDefinedNum = userDefinedTypes.size;
        if(userDefinedTypes.size > 0){
            userDefinedPer = Math.round((userDefinedNum / totalFuncNum) * 10000) / 100 + '％';
        }
        let str = "";

        str += ("upperNaming+ThisBinding:         " + thisBindingNum + "\n");
        str += ("instantiatedNum:        " + instantiatedArr[1] +"\n");
        str += ("  ----instantiatedUsageTimes:        " + instantiatedArr[0] +"\n");
        str += ("isInstanceOf:        " + isInstanceofArr[1]+ "\n");
        str += ("  ----isInstanceOfUsageTimes:        " + isInstanceofArr[0] + "\n");
        str += ("upperNaming+prototypeDefined:    " +  protoDefinedArr[1]+ "\n");
        str += ("  ----upperNaming+prototypeDefinedUsageTimes:    " + protoDefinedArr[0] + "\n");
        str += ("upperNaming+call_ApplyExtend:    " + call_applyExtendArr[1] + "\n");
        str += ("  ----upperNaming+call_ApplyExtendUsageTimes:    " + call_applyExtendArr[0] + "\n");

        str += ("userDefinedNum:       " + userDefinedNum + "\n");
        str += ("totalFunc:           " + totalFuncNum + "\n");
        str += ("userDefinedPer:           " +  userDefinedPer+ "\n");
        console.log(str)
        // res.push(this.mapToObj(obj));

        obj.set('userDefinedNum   ',userDefinedNum);
        //前面获取最终数字的时候直接判断，不仅为this，也为upper
        obj.set('upperNaming + thisBinding    ',thisBindingNum);
        obj.set('instantiatedNum    ',instantiatedArr[1]);
        obj.set('isInstanceOf    ',isInstanceofArr[1]);
        obj.set('upperNaming + prototypeDefined',protoDefinedArr[1]);
        obj.set('upperNaming + call_ApplyExtend',call_applyExtendArr[1]);


        obj.set('instantiatedUsageTimes    ',instantiatedArr[0]);
        obj.set('isInstanceOfUsageTimes    ',isInstanceofArr[0]);
        obj.set('upperNaming + prototypeDefinedUsageTimes',protoDefinedArr[0]);
        obj.set('upperNaming + call_ApplyExtendUsageTimes',call_applyExtendArr[0]);

        // obj.set('useDefinedPer ',userDefinedPer);
        // obj.set('upperPer         ',upperPer);
        // obj.set('instantiatedPer  ',instantiatedNumPer);
        // obj.set('isInstanceOfPer  ',isInstanceOfPer);
        // obj.set('thisBindingPer   ',thisBindingPer);
        // obj.set('protoPer         ',protoPer);
        // obj.set('call_applyPer    ',call_applyPer);

        // obj.set('normalFunc      ',normalFuncNum);
        obj.set('totalFunc       ',totalFuncNum);
        obj.set('userDefinedPer  ',userDefinedPer);
        obj.set('clsName         ',Array.from(userDefinedTypes))
        res.push(this.mapToObj(obj));
        return res;
    }

    mapToObj(map:Map<string,number>){
        let obj= Object.create(null);
        map.forEach(function (value, key, map){
            obj[key] = value;
        })
        return obj;
    }

    getProtoNum(entity:any, userDefinedTypeSet:Set<string>, protoArr:Array<number>, protoClass:Set<string>){
        let funcPureName = "";
        let res = [];
        let protoDefined = [];
        if(entity instanceof ModuleEntity || entity instanceof FunctionEntity || entity instanceof MethodEntity){
            protoDefined = entity.getProtoDefined();
            if(protoDefined.length > 0){
                for(let item of protoDefined){
                    if(item.includes(".prototype")){
                        let func = item.split(".prototype")[0];
                        //把函数加到用户自定义类型集合中
                        if(func !== "" && func !== "Number" && func !== "Boolean" && func !== "String" && func !== ""
                            && func !== "Date" && func !== "Array" && func !== "Function"){
                            //自定义类型个数，不重复
                            protoClass.add(func);
                            //使用次数
                            protoArr[0]++;
                            this.addUserTypes(func,userDefinedTypeSet,'proto');
                        }
                    }
                }
            }
        }
        if(entity instanceof FunctionEntity || entity instanceof MethodEntity){
            funcPureName = entity.getPureName();
            if(funcPureName.includes(".prototype")){
                //使用次数
                protoArr[0]++;
                let func = funcPureName.split(".prototype")[0];
                //把函数加到用户自定义类型集合中
                if(func !== "" && func !== "Number" && func !== "Boolean" && func !== "String" && func !== ""
                    && func !== "Date" && func !== "Array" && func !== "Function"){
                    //自定义类型个数，不重复
                    protoClass.add(func);
                    this.addUserTypes(func,userDefinedTypeSet,'proto');
                }
            }
        }
        res.push(protoArr[0]);
        res.push(protoClass.size);
        return res;
    }

    getInstanceNum(entity:any, userDefinedTypeSet:Set<string>, isInstanceof:Array<number>, instanceClass:Set<string>){
        let instanceNames = entity.getInstanceNames();
        let res = [];
        if(instanceNames.size > 0){
            for(let item of instanceNames){
                if(item !== undefined && item.startsWith("instance_")){
                    let classType = item.split("instance_")[1];
                    if(classType.includes("_1.")){
                        classType = classType.split("_1.")[1];
                    }
                    if(classType !== "Number" && classType !== "Boolean" && classType !== "String" && classType !== ""
                    && classType !== "Date" && classType !== "Array" && classType !== "Function"){
                        isInstanceof[0]++;
                        instanceClass.add(classType)
                        this.addUserTypes(classType,userDefinedTypeSet,"other");
                    }
                }
            }
        }
        res.push(isInstanceof[0]);
        res.push(instanceClass.size);
        // console.log(isInstanceofNum)
        // console.log(instanceClass.size)
        return res;
    }

    getCallApplyNum(entity:any, userDefinedTypeSet:Set<string>, call_applyExtend:Array<number>, call_applyClass:Set<string>){
        let call_applyNames = entity.getCallApply();
        let funcName = "";
        let res = [];
        if(call_applyNames.size > 0){
            for(let item of call_applyNames){
                if(item.endsWith(".call")){
                    funcName = item.split(".call")[0];
                }
                if(item.endsWith(".apply")){
                    funcName = item.split(".apply")[0];
                }
                if(/^[A-Z]/.test(funcName)){
                    call_applyExtend[0]++;
                    call_applyClass.add(funcName);
                    this.addUserTypes(funcName,userDefinedTypeSet,"other");
                }
            }
        }
        res.push(call_applyExtend[0]);
        res.push(call_applyClass.size);
        return res;
    }

    getInstantiatedNum(entity:any, userDefinedTypeSet:Set<string>, instantiated:Array<number>, instantiatedClass:Set<string>){
        let res = [];
        let classArr: string | any[] = [];
        if(entity.getSimpleName() !== undefined){
            if(entity instanceof VarEntity || entity instanceof PropertyEntity){
                classArr = entity.getInferType();
            }
            if(entity instanceof FunctionEntity || entity instanceof MethodEntity || entity instanceof ModuleEntity){
                classArr = entity.getCalledNewFunc();
            }
            if(!entity.getSimpleName().endsWith("this")){
                // let classArr = entity.getInferType();
                let funcName = "";
                let item_split = "";
                // console.log(classArr)
                if(classArr.length > 0) {
                    instantiated[0] += classArr.length;
                    for(let i=0; i<classArr.length; i++){
                        let item = classArr[i];
                        //规范化名字，存入自定义类型集合
                        if(item){
                            if(item.startsWith("new ")){
                                item_split = item.split("new ")[1];
                                if(item_split.includes("_1.")){
                                    funcName = item_split.split("_1.")[1];
                                } else if(item_split.includes("_1")){
                                    funcName = item_split.split("_1")[0];
                                } else if(item_split.includes("(")){
                                    funcName = item_split.split("(")[0];
                                } else{
                                    instantiatedClass.add(item_split)
                                    this.addUserTypes(item_split, userDefinedTypeSet, "instantiated");
                                }
                            }else{
                                if(item.includes("_1.")){
                                    item_split = item.split("_1.")[1];
                                    if(item_split.includes("(") && item_split.includes(")")){
                                        funcName = item_split.split("(")[0];
                                    }
                                }
                            }
                        }
                        if(funcName !== "Number" && funcName !== "Boolean" && funcName !== "String" && funcName !== ""
                            && funcName !== "Date" && funcName !== "Array" && funcName !== "Function"){
                            instantiatedClass.add(funcName)
                            this.addUserTypes(funcName, userDefinedTypeSet, "instantiated");
                        }
                    }
                }
            }
        }
        res.push(instantiated[0]);
        res.push(instantiatedClass.size);
        return res;
    }

    addUserTypes(funcName:string,userDefineTypeSet:Set<string>,type:string){
        if(funcName !== "Number" && funcName !== "Boolean" && funcName !== "String" && funcName !== ""
            && funcName !== "Date" && funcName !== "Array" && funcName !== "Function" && funcName !== 'RegExp'){
            if(!funcName.includes(".")){
                userDefineTypeSet.add(funcName)
            }else{
                // if(funcName.includes(".") && !funcName.includes("(")){
                //     let tmpArr = funcName.split(".")
                //     userDefineTypeSet.add(tmpArr[tmpArr.length-1])
                // }

                if(type == "other"){
                    userDefineTypeSet.add(funcName.split(".")[0]);
                }else if(type == "instantiated"){
                    userDefineTypeSet.add(funcName)
                } else if(type == 'proto'){
                    userDefineTypeSet.add(funcName.split(".prototype")[0]);
                }
            }
        }
    }


    dependencyStatis() {
        let depMap = new Map<string, number>();
        depMap.set(Configure.RELATION_IMPORT, 0);
        depMap.set(Configure.RELATION_UNRESOLVEDIMPORT, 0);
        depMap.set(Configure.RELATION_IMPORTFROM, 0);
        depMap.set(Configure.RELATION_DEFINE, 0);
        depMap.set(Configure.RELATION_CALL, 0);
        depMap.set(Configure.RELATION_POSSIBLECALL, 0);
        depMap.set(Configure.RELATION_CALL_NEW, 0);
        depMap.set(Configure.RELATION_CALLPOINTER, 0);
        depMap.set(Configure.RELATION_EXTEND, 0);
        depMap.set(Configure.RELATION_SET, 0);
        depMap.set(Configure.RELATION_USE, 0);
        depMap.set(Configure.RELATION_INIT, 0);
        depMap.set(Configure.RELATION_MODIFY, 0);
        depMap.set(Configure.RELATION_DEFINEEXPORT, 0);
        depMap.set(Configure.RELATION_DECLAREEXPORT, 0);
        depMap.set(Configure.RELATION_DECLAREDEFAULTEXPORT, 0);
        depMap.set(Configure.RELATION_DEFINESET, 0);
        depMap.set(Configure.RELATION_DEFINEDEFAULTEXPORT, 0);
        depMap.set(Configure.RELATION_ALIAS, 0);
        for (let entity of this.singleCollect.getEntities()) {
            for (let re of entity.getRelations()) {
                if(re.x == Configure.RELATION_IMPORT ||
                    re.x==Configure.RELATION_UNRESOLVEDIMPORT ||
                    re.x==Configure.RELATION_IMPORTFROM ||
                    re.x==Configure.RELATION_DEFINE ||
                    re.x==Configure.RELATION_CALL ||
                    re.x==Configure.RELATION_POSSIBLECALL ||
                    re.x==Configure.RELATION_CALL_NEW ||
                    re.x==Configure.RELATION_CALLPOINTER ||
                    re.x==Configure.RELATION_EXTEND ||
                    re.x==Configure.RELATION_SET||
                    re.x==Configure.RELATION_USE ||
                    re.x==Configure.RELATION_INIT ||
                    re.x==Configure.RELATION_MODIFY ||
                    re.x==Configure.RELATION_DEFINEEXPORT ||
                    re.x==Configure.RELATION_DECLAREEXPORT ||
                    re.x==Configure.RELATION_DECLAREDEFAULTEXPORT ||
                    re.x==Configure.RELATION_DEFINESET ||
                    re.x==Configure.RELATION_DEFINEDEFAULTEXPORT ||
                    re.x==Configure.RELATION_ALIAS
                ) {
                    let old = depMap.get(re.x);
                    // @ts-ignore
                    depMap.set(re.x, old + 1);
                }
            }
        }
        let str = "";
        depMap.forEach(function (value, key, map){
            str += key;
            str += ":    ";
            str += value;
            str += "\n";
        })
        console.log(str);
        return str;
    }

    getImportDeps(level:string) {
        //let deps = new Set<RelationTuple<string, string>>();
        for (let entity of this.singleCollect.getEntities()) {
            if (entity instanceof ModuleEntity) {
                //console.log(entity.getId())
                this.deps = this.getImportDepsForEntity(entity.getId(), level);
               // console.log(deps)
                if(this.deps !== undefined){
                    for(let dep of this.deps){
                        this.deps.add(dep)
                    }
                }
               // console.log(deps)
            }
        }
        return this.deps;
    }

    getImportFromDeps(level:string){
        this.deps.clear();
        for (let entity of this.singleCollect.getEntities()) {
            if (entity instanceof ModuleEntity) {
                //console.log(entity.getId())
                this.deps = this.getImportFromDepForEntity(entity.getId(), level);
                //console.log(this.deps)
                if(this.deps !== undefined){
                    for(let dep of this.deps){
                        this.deps.add(dep)
                    }
                }
            }
        }
       return this.deps;
    }

    getDefineDeps(level:string){
        this.deps.clear();
        for (let entity of this.singleCollect.getEntities()) {
            if (entity instanceof ModuleEntity || entity instanceof FunctionEntity || entity instanceof VarEntity
                || entity instanceof MethodEntity || entity instanceof ClassEntity || entity instanceof PropertyEntity){
                this.deps = this.getDefineDepForEntity(entity.getId(), level);
                if(this.deps !== undefined){
                    for(let dep of this.deps){
                        this.deps.add(dep)
                    }
                }
            }
        }
        return this.deps;
    }

    getCallDeps(level:string){
        this.deps.clear();
        for (let entity of this.singleCollect.getEntities()) {
            if (entity instanceof ModuleEntity || entity instanceof FunctionEntity
                || entity instanceof MethodEntity) {
                this.deps = this.getCallDepForEntity(entity.getId(), level);
                if(this.deps !== undefined){
                    for(let dep of this.deps){
                        this.deps.add(dep)
                    }
                }
            }
        }
        return this.deps;
    }

    getCallNewDeps(level:string){
        this.deps.clear();
        for (let entity of this.singleCollect.getEntities()) {
            if (entity instanceof ModuleEntity || entity instanceof FunctionEntity
                || entity instanceof MethodEntity) {
                this.deps = this.getCallNewDepForEntity(entity.getId(), level);
                if(this.deps !== undefined){
                    for(let dep of this.deps){
                        this.deps.add(dep)
                    }
                }
            }
        }
        return this.deps;
    }

    getPointerDeps(level:string){
        this.deps.clear();
        for (let entity of this.singleCollect.getEntities()) {
            if (entity instanceof ModuleEntity || entity instanceof FunctionEntity
                || entity instanceof MethodEntity) {
                this.deps = this.getPointerDepForEntity(entity.getId(), level);
                if(this.deps !== undefined){
                    for(let dep of this.deps){
                        this.deps.add(dep)
                    }
                }
            }
        }
        return this.deps;
    }

    getExtendDeps(level:string){
        this.deps.clear();
        for (let entity of this.singleCollect.getEntities()) {
            if(entity instanceof ClassEntity){
                this.deps = this.getExtendDepForEntity(entity.getId(), level);
                if(this.deps !== undefined){
                    for(let dep of this.deps){
                        this.deps.add(dep)
                    }
                }
            }
        }
        return this.deps;
    }

    getSetDeps(level:string){
        this.deps.clear();
        for (let entity of this.singleCollect.getEntities()) {
            if (entity instanceof ModuleEntity || entity instanceof FunctionEntity
                || entity instanceof MethodEntity || entity instanceof VarEntity || entity instanceof PropertyEntity) {
                this.deps = this.getSetDepForEntity(entity.getId(), level);
                if(this.deps !== undefined){
                    for(let dep of this.deps){
                        this.deps.add(dep)
                    }
                }
            }
        }
        return this.deps;
    }

    getUseDeps(level:string){
        this.deps.clear();
        for (let entity of this.singleCollect.getEntities()) {
            if (entity instanceof ModuleEntity || entity instanceof FunctionEntity
                || entity instanceof MethodEntity || entity instanceof VarEntity ||entity instanceof PropertyEntity) {
                //console.log(entity)
                this.deps = this.getUseDepForEntity(entity.getId(), level);
                if(this.deps !== undefined){
                    for(let dep of this.deps){
                        this.deps.add(dep)
                    }
                }
            }
        }
        return this.deps;
    }

    getInitDeps(level:string){
        this.deps.clear();
        for (let entity of this.singleCollect.getEntities()) {
            if (entity instanceof ModuleEntity || entity instanceof FunctionEntity ||entity instanceof ClassEntity
                || entity instanceof MethodEntity || entity instanceof VarEntity || entity instanceof PropertyEntity) {
                //console.log(entity)
                this.deps = this.getInitDepForEntity(entity.getId(), level);
                if(this.deps !== undefined){
                    for(let dep of this.deps){
                        this.deps.add(dep)
                    }
                }
            }
        }
        return this.deps;
    }

    getModifyDeps(level:string){
        this.deps.clear();
        for (let entity of this.singleCollect.getEntities()) {
            if (entity instanceof ModuleEntity || entity instanceof FunctionEntity
                || entity instanceof MethodEntity || entity instanceof PropertyEntity ||entity instanceof VarEntity) {
                //console.log(entity)
                this.deps = this.getModifyDepForEntity(entity.getId(), level);
                if(this.deps !== undefined){
                    for(let dep of this.deps){
                        this.deps.add(dep)
                    }
                }
            }
        }
        return this.deps;
    }

    getDefineExportDeps(level:string){
        this.deps.clear();
        for (let entity of this.singleCollect.getEntities()) {
            if (entity instanceof ModuleEntity || entity instanceof FunctionEntity
            || entity instanceof VarEntity || entity instanceof ClassEntity) {
                //console.log(entity)
                this.deps = this.getDefineExportDepForEntity(entity.getId(), level);
                if(this.deps !== undefined){
                    for(let dep of this.deps){
                        this.deps.add(dep)
                    }
                }
            }
        }
        return this.deps;
    }

    getDeclareExportDeps(level:string){
        this.deps.clear();
        for (let entity of this.singleCollect.getEntities()) {
            if (entity instanceof FunctionEntity || entity instanceof MethodEntity
            || entity instanceof VarEntity || entity instanceof ClassEntity) {
                //console.log(entity)
                this.deps = this.getDeclareExportDepForEntity(entity.getId(), level);
                if(this.deps !== undefined){
                    for(let dep of this.deps){
                        this.deps.add(dep)
                    }
                }
            }
        }
        return this.deps;
    }

    getDefineSetDeps(level:string){
        this.deps.clear();
        for (let entity of this.singleCollect.getEntities()) {
            if (entity instanceof FunctionEntity || entity instanceof VarEntity
                || entity instanceof ClassEntity ||entity instanceof PropertyEntity) {
                //console.log(entity)
                this.deps = this.getDefineSetDepForEntity(entity.getId(), level);
                if(this.deps !== undefined){
                    for(let dep of this.deps){
                        this.deps.add(dep)
                    }
                }
            }
        }
        return this.deps;
    }

    getDefineDefaultExportDeps(level:string){
        this.deps.clear();
        for (let entity of this.singleCollect.getEntities()) {
            if (entity instanceof FunctionEntity || entity instanceof VarEntity ||entity instanceof ClassEntity) {
                //console.log(entity)
                this.deps = this.getDefineDefaultExportDepForEntity(entity.getId(), level);
                if(this.deps !== undefined){
                    for(let dep of this.deps){
                        this.deps.add(dep)
                    }
                }
            }
        }
        return this.deps;
    }

    getDeclareExportDefaultDeps(level:string) {
        this.deps.clear();
        for (let entity of this.singleCollect.getEntities()) {
            if (entity instanceof FunctionEntity || entity instanceof VarEntity ||entity instanceof ClassEntity) {
                //console.log(entity)
                this.deps = this.getDeclareDefaultExportDepForEntity(entity.getId(), level);
                if(this.deps !== undefined){
                    for(let dep of this.deps){
                        this.deps.add(dep)
                    }
                }
            }
        }
        return this.deps;
    }

    getAliasDeps(level:string){
        this.deps.clear();
        for (let entity of this.singleCollect.getEntities()) {
            if (entity instanceof ModuleEntity) {
                //console.log(entity)
                this.deps = this.getAliasDepForEntity(entity.getId(), level);
                if(this.deps !== undefined){
                    for(let dep of this.deps){
                        this.deps.add(dep)
                    }
                }
            }
        }
        return this.deps;
    }

    getImportDepsForEntity(moduelId:number, level:string) {
        let modObj = Array.from(this.singleCollect.getEntities())[moduelId];
        let name1 = modObj.getQualifiedName();
        let fileName1 = this.getEntityFileName(moduelId);

        for(let relation of modObj.getRelations()) {
            if(relation.x == Configure.RELATION_IMPORT) {
                //console.log(relation)
                let id2 = relation.y;
                let entityObj = Array.from(this.singleCollect.getEntities())[id2];
                //部分关系未处理好，可能存在undefined,这里先过滤一下
                let name2;
                if(entityObj !== undefined){
                    name2 = entityObj.getQualifiedName();
                }
                //let name2 = entityObj.getQualifiedName();
                let fileName2 = this.getEntityFileName(id2);
                // if(level == "ModuleEntity") {
                //     if (!(fileName1 == "")
                //     && !(fileName2 == "")) {
                //         let dep = new RelationTuple<string, string>(fileName1, fileName2);
                //         deps.add(dep);
                //     }
                // } else {
                //     // let dep = new RelationTuple<string, string>(name1, name2);
                //     // deps.add(dep);
                // }
                let dep = new RelationTuple<string, string>(name1, name2);
                this.deps.add(dep);
            }
        }
        //console.log(deps.size)
            return this.deps;
    }

    getImportFromDepForEntity(moduelId:number, level:string){
        let modObj = Array.from(this.singleCollect.getEntities())[moduelId];
        let name1 = modObj.getQualifiedName();
        let fileName1 = this.getEntityFileName(moduelId);

        for (let relation of modObj.getRelations()) {
            //console.log(relation)
            if (relation.x == Configure.RELATION_IMPORTFROM) {
                let name2;
                let id2 = relation.y;
                let entityObj = Array.from(this.singleCollect.getEntities())[id2];
                if(entityObj !== undefined){
                    name2 = entityObj.getQualifiedName();
                }
                //let name2 = entityObj.getQualifiedName();
                let fileName2 = this.getEntityFileName(id2);
                //console.log(name1+",,,"+name2)
                // if(level == "ModuleEntity") {
                //     if (!(fileName1 == "")
                //         && !(fileName2 == "")) {
                //         let dep = new RelationTuple<string, string>(fileName1, fileName2);
                //         deps.add(dep);
                //     }
                // } else {
                //     let dep = new RelationTuple<string, string>(name1, name2);
                //     deps.add(dep);
                // }
                let dep = new RelationTuple<string, string>(name1, name2);
                // console.log(dep)
                this.deps.add(dep);
                //console.log(this.deps)
            }
        }
        return this.deps;
    }

    getDefineDepForEntity(entityId:number, level:string){
        let deps = new Set<RelationTuple<string, string>>();
        let modObj = Array.from(this.singleCollect.getEntities())[entityId];
        let name1 = modObj.getQualifiedName();
        let fileName1 = this.getEntityFileName(entityId);

        for (let relation of modObj.getRelations()) {
            if (relation.x == Configure.RELATION_DEFINE) {
                let name2;
                let id2 = relation.y;
                let entityObj = Array.from(this.singleCollect.getEntities())[id2];
                if(entityObj !== undefined){
                    name2 = entityObj.getQualifiedName();
                }
                //let name2 = entityObj.getQualifiedName();
                //let name2 = entityObj.getQualifiedName();
                let fileName2 = this.getEntityFileName(id2);

                // if(level == "ModuleEntity") {
                //     if (!(fileName1 == "")
                //         && !(fileName2 == "")) {
                //         let dep = new RelationTuple<string, string>(fileName1, fileName2);
                //         deps.add(dep);
                //     }
                // } else {
                //     // let dep = new RelationTuple<string, string>(name1, name2);
                //     // deps.add(dep);
                // }
                let dep = new RelationTuple<string, string>(name1, name2);
                this.deps.add(dep);
            }
        }
        return this.deps;
    }

    getCallDepForEntity(entityId:number, level:string){
        let modObj = Array.from(this.singleCollect.getEntities())[entityId];
        let name1 = modObj.getQualifiedName();
        let fileName1 = this.getEntityFileName(entityId);

        for (let relation of modObj.getRelations()) {
            if (relation.x == Configure.RELATION_CALL) {
                let name2;
                let id2 = relation.y;
                let entityObj = Array.from(this.singleCollect.getEntities())[id2];
                if(entityObj !== undefined){
                    name2 = entityObj.getQualifiedName();
                }
                //let name2 = entityObj.getQualifiedName();
                let fileName2 = this.getEntityFileName(id2);

                // if(level == "ModuleEntity") {
                //     if (!(fileName1 == "")
                //         && !(fileName2 == "")) {
                //         let dep = new RelationTuple<string, string>(fileName1, fileName2);
                //         deps.add(dep);
                //     }
                // } else {
                //     let dep = new RelationTuple<string, string>(name1, name2);
                //     deps.add(dep);
                // }
                let dep = new RelationTuple<string, string>(name1, name2);
                this.deps.add(dep);
            }
        }
        return this.deps;
    }

    getCallNewDepForEntity(entityId:number, level:string){
        let modObj = Array.from(this.singleCollect.getEntities())[entityId];
        let name1 = modObj.getQualifiedName();
        let fileName1 = this.getEntityFileName(entityId);

        for (let relation of modObj.getRelations()) {
            if (relation.x == Configure.RELATION_CALL_NEW) {
                let name2;
                let id2 = relation.y;
                let entityObj = Array.from(this.singleCollect.getEntities())[id2];
                if(entityObj !== undefined){
                    name2 = entityObj.getQualifiedName();
                }
                //let name2 = entityObj.getQualifiedName();
                let fileName2 = this.getEntityFileName(id2);

                // if(level == "ModuleEntity") {
                //     if (!(fileName1 == "")
                //         && !(fileName2 == "")) {
                //         let dep = new RelationTuple<string, string>(fileName1, fileName2);
                //         deps.add(dep);
                //     }
                // } else {
                //     let dep = new RelationTuple<string, string>(name1, name2);
                //     deps.add(dep);
                // }
                let dep = new RelationTuple<string, string>(name1, name2);
                this.deps.add(dep);
            }
        }
        return this.deps;
    }

    getPointerDepForEntity(entityId:number, level:string){
        let modObj = Array.from(this.singleCollect.getEntities())[entityId];
        let name1 = modObj.getQualifiedName();
        let fileName1 = this.getEntityFileName(entityId);

        for (let relation of modObj.getRelations()) {
            if (relation.x == Configure.RELATION_CALLPOINTER) {
                let name2;
                let id2 = relation.y;
                let entityObj = Array.from(this.singleCollect.getEntities())[id2];
                if(entityObj !== undefined){
                    name2 = entityObj.getQualifiedName();
                }
                //let name2 = entityObj.getQualifiedName();
                let fileName2 = this.getEntityFileName(id2);

                // if(level == "ModuleEntity") {
                //     if (!(fileName1 == "")
                //         && !(fileName2 == "")) {
                //         let dep = new RelationTuple<string, string>(fileName1, fileName2);
                //         deps.add(dep);
                //     }
                // } else {
                //     let dep = new RelationTuple<string, string>(name1, name2);
                //     deps.add(dep);
                // }
                let dep = new RelationTuple<string, string>(name1, name2);
                this.deps.add(dep);
            }
        }
        return this.deps;
    }

    getExtendDepForEntity(entityId:number, level:string):Set<RelationTuple<string, string>>{
        let classObj = Array.from(this.singleCollect.getEntities())[entityId];
        let name1 = classObj.getQualifiedName();
        let fileName1 = this.getEntityFileName(entityId);

        for (let relation of classObj.getRelations()) {
            if (relation.x == Configure.RELATION_EXTEND) {
                let name2;
                let id2 = relation.y;
                let entityObj = Array.from(this.singleCollect.getEntities())[id2];
                if(entityObj !== undefined){
                    name2 = entityObj.getQualifiedName();
                }
                //let name2 = entityObj.getQualifiedName();
                let fileName2 = this.getEntityFileName(id2);

                // if(level == "ModuleEntity") {
                //     if (!(fileName1 == "")
                //         && !(fileName2 == "")) {
                //         let dep = new RelationTuple<string, string>(fileName1, fileName2);
                //         deps.add(dep);
                //     }
                // } else {
                //     let dep = new RelationTuple<string, string>(name1, name2);
                //     deps.add(dep);
                // }
                let dep = new RelationTuple<string, string>(name1, name2);
                this.deps.add(dep);
                //return this.deps;
            }
        }
        return this.deps;
    }

    getSetDepForEntity(entityId:number, level:string){
        let entityObj = Array.from(this.singleCollect.getEntities())[entityId];
        let name1 = entityObj.getQualifiedName();
        let fileName1 = this.getEntityFileName(entityId);

        for (let relation of entityObj.getRelations()) {
            if (relation.x == Configure.RELATION_SET) {
                let name2;
                let id2 = relation.y;
                let entityObj = Array.from(this.singleCollect.getEntities())[id2];
                if(entityObj !== undefined){
                    name2 = entityObj.getQualifiedName();
                }
                //let name2 = entityObj.getQualifiedName();
                let fileName2 = this.getEntityFileName(id2);
                let dep = new RelationTuple<string, string>(name1, name2);
                this.deps.add(dep);
            }
        }
        return this.deps;
    }

    getUseDepForEntity(entityId:number, level:string){
        let modObj = Array.from(this.singleCollect.getEntities())[entityId];
        let name1 = modObj.getQualifiedName();
        let fileName1 = this.getEntityFileName(entityId);

        for (let relation of modObj.getRelations()) {
            if (relation.x == Configure.RELATION_USE) {
                let name2;
                let id2 = relation.y;
                let entityObj = Array.from(this.singleCollect.getEntities())[id2];
                if(entityObj !== undefined){
                    name2 = entityObj.getQualifiedName();
                }
                //let name2 = entityObj.getQualifiedName();
                let fileName2 = this.getEntityFileName(id2);

                // if(level == "ModuleEntity") {
                //     if (!(fileName1 == "")
                //         && !(fileName2 == "")) {
                //         let dep = new RelationTuple<string, string>(fileName1, fileName2);
                //         deps.add(dep);
                //     }
                // } else {
                //     let dep = new RelationTuple<string, string>(name1, name2);
                //     deps.add(dep);
                // }
                let dep = new RelationTuple<string, string>(name1, name2);
                this.deps.add(dep);
            }
        }
        return this.deps;
    }

    getInitDepForEntity(entityId:number, level:string){
        let modObj = Array.from(this.singleCollect.getEntities())[entityId];
        let name1 = modObj.getQualifiedName();
        let fileName1 = this.getEntityFileName(entityId);

        for (let relation of modObj.getRelations()) {
            if (relation.x == Configure.RELATION_INIT) {
                let name2;
                let id2 = relation.y;
                let entityObj = Array.from(this.singleCollect.getEntities())[id2]
                if(entityObj !== undefined){
                    name2 = entityObj.getQualifiedName();
                }
                //let name2 = entityObj.getQualifiedName();
                let fileName2 = this.getEntityFileName(id2);
                let dep = new RelationTuple<string, string>(name1, name2);
                this.deps.add(dep);
            }
        }
        return this.deps;
    }

    getModifyDepForEntity(entityId:number, level:string){
        let deps = new Set<RelationTuple<string, string>>();
        let modObj = Array.from(this.singleCollect.getEntities())[entityId];
        let name1 = modObj.getQualifiedName();
        let fileName1 = this.getEntityFileName(entityId);

        for (let relation of modObj.getRelations()) {
            if (relation.x == Configure.RELATION_MODIFY) {
                let name2;
                let id2 = relation.y;
                let entityObj = Array.from(this.singleCollect.getEntities())[id2]
                if(entityObj !== undefined){
                    name2 = entityObj.getQualifiedName();
                }
                //let name2 = entityObj.getQualifiedName();
                let fileName2 = this.getEntityFileName(id2);
                let dep = new RelationTuple<string, string>(name1, name2);
                this.deps.add(dep);
            }
        }
        return this.deps;
    }

    getDefineExportDepForEntity(entityId:number, level:string){
        let modObj = Array.from(this.singleCollect.getEntities())[entityId];
        let name1 = modObj.getQualifiedName();
        let fileName1 = this.getEntityFileName(entityId);

        for (let relation of modObj.getRelations()) {
            if (relation.x == Configure.RELATION_DEFINEEXPORT) {
                let id2 = relation.y;
                let entityObj = Array.from(this.singleCollect.getEntities())[id2]
                let name2 = entityObj.getQualifiedName();
                let fileName2 = this.getEntityFileName(id2);

                // if(level == "ModuleEntity") {
                //     if (!(fileName1 == "")
                //         && !(fileName2 == "")) {
                //         let dep = new RelationTuple<string, string>(fileName1, fileName2);
                //         deps.add(dep);
                //     }
                // } else {
                //     let dep = new RelationTuple<string, string>(name1, name2);
                //     deps.add(dep);
                // }
                let dep = new RelationTuple<string, string>(name1, name2);
                this.deps.add(dep);
            }
        }
        return this.deps;
    }

    getDeclareExportDepForEntity(entityId:number, level:string){
        let modObj = Array.from(this.singleCollect.getEntities())[entityId];
        let name1 = modObj.getQualifiedName();
        let fileName1 = this.getEntityFileName(entityId);

        for (let relation of modObj.getRelations()) {
            if (relation.x == Configure.RELATION_DECLAREEXPORT) {
                let id2 = relation.y;
                let entityObj = Array.from(this.singleCollect.getEntities())[id2]
                let name2 = entityObj.getQualifiedName();
                let fileName2 = this.getEntityFileName(id2);

                // if(level == "ModuleEntity") {
                //     if (!(fileName1 == "")
                //         && !(fileName2 == "")) {
                //         let dep = new RelationTuple<string, string>(fileName1, fileName2);
                //         deps.add(dep);
                //     }
                // } else {
                //     let dep = new RelationTuple<string, string>(name1, name2);
                //     deps.add(dep);
                // }
                let dep = new RelationTuple<string, string>(name1, name2);
                this.deps.add(dep);
            }
        }
        return this.deps;
    }

    getDefineSetDepForEntity(entityId:number, level:string){
        let modObj = Array.from(this.singleCollect.getEntities())[entityId];
        let name1 = modObj.getQualifiedName();
        let fileName1 = this.getEntityFileName(entityId);

        for (let relation of modObj.getRelations()) {
            if (relation.x == Configure.RELATION_DEFINESET) {
                let id2 = relation.y;
                let entityObj = Array.from(this.singleCollect.getEntities())[id2]
                let name2 = entityObj.getQualifiedName();
                let fileName2 = this.getEntityFileName(id2);

                // if(level == "ModuleEntity") {
                //     if (!(fileName1 == "")
                //         && !(fileName2 == "")) {
                //         let dep = new RelationTuple<string, string>(fileName1, fileName2);
                //         deps.add(dep);
                //     }
                // } else {
                //     let dep = new RelationTuple<string, string>(name1, name2);
                //     deps.add(dep);
                // }
                let dep = new RelationTuple<string, string>(name1, name2);
                this.deps.add(dep);
            }
        }
        return this.deps;
    }

    getDefineDefaultExportDepForEntity(entityId:number, level:string){
        let modObj = Array.from(this.singleCollect.getEntities())[entityId];
        let name1 = modObj.getQualifiedName();
        let fileName1 = this.getEntityFileName(entityId);

        for (let relation of modObj.getRelations()) {
            if (relation.x == Configure.RELATION_DEFINEDEFAULTEXPORT) {
                let id2 = relation.y;
                let entityObj = Array.from(this.singleCollect.getEntities())[id2]
                let name2 = entityObj.getQualifiedName();
                let fileName2 = this.getEntityFileName(id2);

                // if(level == "ModuleEntity") {
                //     if (!(fileName1 == "")
                //         && !(fileName2 == "")) {
                //         let dep = new RelationTuple<string, string>(fileName1, fileName2);
                //         deps.add(dep);
                //     }
                // } else {
                //     let dep = new RelationTuple<string, string>(name1, name2);
                //     deps.add(dep);
                // }
                let dep = new RelationTuple<string, string>(name1, name2);
                this.deps.add(dep);
            }
        }
        return this.deps;
    }

    getDeclareDefaultExportDepForEntity(entityId:number, level:string) {
        let modObj = Array.from(this.singleCollect.getEntities())[entityId];
        let name1 = modObj.getQualifiedName();
        let fileName1 = this.getEntityFileName(entityId);

        for (let relation of modObj.getRelations()) {
            if (relation.x == Configure.RELATION_DECLAREDEFAULTEXPORTED_BY) {
                let id2 = relation.y;
                let entityObj = Array.from(this.singleCollect.getEntities())[id2]
                let name2 = entityObj.getQualifiedName();
                let fileName2 = this.getEntityFileName(id2);

                // if(level == "ModuleEntity") {
                //     if (!(fileName1 == "")
                //         && !(fileName2 == "")) {
                //         let dep = new RelationTuple<string, string>(fileName1, fileName2);
                //         deps.add(dep);
                //     }
                // } else {
                //     let dep = new RelationTuple<string, string>(name1, name2);
                //     deps.add(dep);
                // }
                let dep = new RelationTuple<string, string>(name1, name2);
                this.deps.add(dep);
            }
        }
        return this.deps;
    }

    getAliasDepForEntity(entityId:number, level:string){
        let modObj = Array.from(this.singleCollect.getEntities())[entityId];
        let name1 = modObj.getQualifiedName();
        let fileName1 = this.getEntityFileName(entityId);

        for (let relation of modObj.getRelations()) {
            if (relation.x == Configure.RELATION_ALIAS) {
                let id2 = relation.y;
                let entityObj = Array.from(this.singleCollect.getEntities())[id2]
                let name2 = entityObj.getQualifiedName();
                let fileName2 = this.getEntityFileName(id2);

                // if(level == "ModuleEntity") {
                //     if (!(fileName1 == "")
                //         && !(fileName2 == "")) {
                //         let dep = new RelationTuple<string, string>(fileName1, fileName2);
                //         deps.add(dep);
                //     }
                // } else {
                //     let dep = new RelationTuple<string, string>(name1, name2);
                //     deps.add(dep);
                // }
                let dep = new RelationTuple<string, string>(name1, name2);
                this.deps.add(dep);
            }
        }
        return this.deps;
    }

    getEntityFileName(entityId:number) {
        let fileName = "";
        if(entityId == -1) {
            return fileName;
        }
        let entity  = Array.from(this.singleCollect.getEntities())[entityId]
        let fileId = entityId;
        while(fileId != -1
        && !(entity instanceof ModuleEntity) && entity !== undefined) {
            fileId = entity.getParentId();
            entity  = Array.from(this.singleCollect.getEntities())[fileId]
        }
        let fileEntity  = Array.from(this.singleCollect.getEntities())[fileId]
        //console.log(fileEntity)
        if(fileId != -1 && fileEntity instanceof ModuleEntity) {
            return fileEntity.getQualifiedName();
        }
        return fileName;
    }
}
export default JsRelationInfo;