import Entity from "./Entity";
import LocalName from "../uerr/LocalName";
class FunctionEntity extends Entity{
    public category = "Function";
    private codeSnippet = "";
    private loc = "";
    private pureName = "";
    private generator = false;
    private async = false;
    private topFunc = false;
    private isArrow = false;
    // private originType = "Normal Function";
    private classDefinition = new Array<string>();
    //保存单个param对象信息
    private parameters = new Map();
    private params = new Array<[]>();
    private paramIds = new Set<number>()
    private innerLoc = new Array<string>();
    private returns = new Array<string>();
    private returnLoc = new Array<string>()
    public calledFunc = new Set<string>();
    public calledFuncId = new Set<number>();
    private calledNewFunc = new Set<string>();
    private callNewFuncArr = new Array<string>();
    private calledNewFuncId = new Set<number>();
    private unnamed_funcIds = new Set<number>();
    private possiblePointer = new Set<string>();
    //generate in the first visit. will be further processed in the second visit.
    //in the second visit, all these information is stored in name2IdMap, name2UsageMap, name2RoleMap.
    //protected localNames = new Set<LocalName>(); //the initial Names appear in a function
    protected localNames = new Set<LocalName>(); //the initial Names appear in a function
    protected name2IdMap = new Map<string, number>(); //map from the usedName inside function into the entityId.
    //local name -> role (parameter, return , globalvar, localVar, function, package)
    // protected id2Code = new Map<number, string>();
    protected code = new Set<string>();
    protected codeMap = new Array<string>();
    //local name -> usage (set, use)
    private nameMap = new Map<string, Set<string>>();
    private obj = Object.create(null);
    protected name2Usage = new Set<Map<string, Set<string>>>();
    //store the final usagewithweight ("usage", (nameEntityId, weight))/
    private finalUsageMap = new Map<string, Map<number, number>>();
    private thisBinding = false;
    private protoDefined = new Set<string>();
    private protoDefinedArr = new Array<string>()
    private call_apply = new Set<string>();
    private instanceNames = new Set<string>();

    constructor(id:number,name:string,qualifiedName:string) {
        super();
        this.id = id;
        this.simpleName = name;
        this.qualifiedName = qualifiedName;
    }

    initParameters(id:number, pure_name:string, name:string, useSeq: []) {
        this.parameters.set("id",id);
        this.parameters.set("pureName",pure_name);
        this.parameters.set("name",name);
        this.parameters.set("useSeq",useSeq);
        let tempPara = this.mapToObj(this.parameters);
        this.addParams(tempPara);
    }

    mapToObj(map:Map<string,string>){
        let obj= Object.create(null);
        map.forEach(function (value, key, map){
            obj[key] = value;
        })
        return obj;
    }

    getCategory() {
        return this.category;
    }

    getCodeSnippet() {
        return this.codeSnippet;
    }

    setCodeSnippet(codeSnippet:string) {
        this.codeSnippet = codeSnippet;
    }

    getIsArrow() {
        return this.isArrow;
    }

    setIsArrow(isArrow:boolean) {
        this.isArrow = isArrow;
    }

    getLoc() {
        return this.loc;
    }

    setLoc(loc:string) {
        this.loc = loc;
    }

    getTopFunc() {
        return this.topFunc;
    }

    setTopFunc(topfunc:boolean) {
        this.topFunc = topfunc;
    }

    getPureName() {
        return this.pureName;
    }

    setPureName(pureName:string) {
        this.pureName = pureName;
    }


    getClassType() {
        return this.classDefinition;
    }

    setClassType(classType:string) {
        this.classDefinition.push(classType);
    }

    getGenerator() {
        return this.generator;
    }

    setGenerator(generator:boolean) {
        this.generator = generator;
    }

    getAsync() {
        return this.async;
    }

    setAsync(async:boolean) {
        this.async = async;
    }

    addParamIds(paramId:number) {
        this.paramIds.add(paramId);
    }

    getParameters() {
        return this.paramIds;
    }

    addParams(param:[]) {
        this.params.push(param);
    }

    getParams() {
        return this.params;
    }

    addInnerLoc(loc:string) {
        this.innerLoc.push(loc);
    }

    getInnerLoc() {
        return this.innerLoc;
    }

    getReturns() {
        return this.returns;
    }

    addReturns(returns:string) {
        this.returns.push(returns);
    }

    addReturnLoc(loc:string) {
        this.returnLoc.push(loc);
    }

    getReturnLoc() {
        return this.returnLoc;
    }

    addCalledFuncOrCls(functionName:string) {
        this.calledFunc.add(functionName);
    }

    getCalledFuncOrCls() {
        return this.calledFunc;
    }

    setCalledFuncOrCls(calledFunctions:Set<string>) {
        this.calledFunc.clear();
        for (let entry of calledFunctions) {
            this.calledFunc.add(entry);
        }
    }

    setCalledNewFuncs(calledNewFunctions:Set<string>) {
        this.calledNewFunc.clear();
        for (let entry of calledNewFunctions) {
            this.calledNewFunc.add(entry);
        }
    }

    addCalledFuncOrClsId(id:number){
        this.calledFuncId.add(id);
    }

    getCalledFuncOrClsId(){
        return this.calledFuncId;
    }

    addCallNewFunc(calleeStr:string) {
        this.calledNewFunc.add(calleeStr);
        this.callNewFuncArr = Array.from(this.calledNewFunc)
    }

    getCalledNewFunc() {
        return this.callNewFuncArr;
    }

    getCalledNewFuncSet() {
        return this.calledNewFunc;
    }


    addCallNewFuncId(id:number){
        this.calledNewFuncId.add(id);
    }

    getCallNewFuncId(){
        return this.calledNewFuncId;
    }

    addUnNamed_FuncId(id:number){
        this.unnamed_funcIds.add(id);
    }

    getUnNamed_FuncId(){
        return this.unnamed_funcIds;
    }

    addPossiblePointer(str:string){
        this.possiblePointer.add(str);
    }

    getPossiblePointer(){
        return this.possiblePointer;
    }

    getFinalUsageMap() {
        return this.finalUsageMap;
    }

    addLocalName(oneLocalName:LocalName) {
        this.localNames.add(oneLocalName);
    }

    getLocalNames() {
        return this.localNames;
    }

    getName2IdMap() {
        return this.name2IdMap;
    }

    addName2Id(name:string, id:number) {
        if(!this.name2IdMap.has(name)) {
            this.name2IdMap.set(name, id);
        }
    }

    // getId2CodeMap() {
    //     return this.id2Code;
    // }
    //
    // adId2Code(id:number, code:string) {
    //     if(!this.id2Code.has(id)) {
    //         this.id2Code.set(id, code);
    //     }
    // }



    getCode() {
        return this.codeMap;
    }


    addCode(code:string) {
        code = this.filterCode(code)
        if(code !== "") {
            this.code.add(code);
            // if(this.code.size > 0) {
            //     this.code.forEach(item=> {
            //         if(item.indexOf(code) !== -1){
            //             this.code.add(code);
            //         }
            //     })
            // }
        }
        this.codeMap = [...this.code];
    }

    filterCode(code:string) {
        if(code.endsWith(";")) {
            code = code.split(";")[0]
        }
        if(code == '[]' || /^[a-zA-Z]+$/.test(code)|| code.trim().includes("return ") || code.trim().includes("const ")
            || code.trim().includes("let ") || code.trim().includes("var ")) {
            code = ''
        }
        // if(code == '[]' || /^[a-zA-Z]+$/.test(code) || /\d/.test(code) || code.trim().startsWith("return") || code.trim().startsWith("const")
        //     || code.trim().startsWith("let") || code.trim().startsWith("var")) {
        //     code = ''
        // }
        return code;
    }

    getName2UsageMap() {
        return this.name2Usage;
    }


    addName2Usage(name:string, usage:string) {
        // console.log(name)
        // console.log(this.nameMap)
        if (!this.nameMap.has(name)) {
            this.nameMap.set(name, new Set<string>());
        }
        // @ts-ignore
        if(!this.nameMap.get(name).has(usage)) {
            // @ts-ignore
            this.nameMap.get(name).add(usage);
        }
        let tempMap = this.map2Obj(this.nameMap);
        this.name2Usage.add(tempMap);
    }


    map2Obj(map:Map<string, Set<string>>) {
        map.forEach((value, key, map) =>{
            this.obj[key] = [...value];
        })
        return this.obj;
    }


    getThisBinding() {
        return this.thisBinding;
    }

    setThisBinding(thisBinding:boolean) {
        this.thisBinding = thisBinding;
    }

    getProtoDefined() {
        return this.protoDefinedArr;
    }

    addProtoDefined(name:string){
        this.protoDefined.add(name);
        this.protoDefinedArr = Array.from(this.protoDefined)
    }

    getCallApply() {
        return this.call_apply;
    }

    addCallApply(name:string){
        this.call_apply.add(name);
    }

    getInstanceNames() {
        return this.instanceNames;
    }

    addInstanceNames(name:string){
        this.instanceNames.add(name);
    }


    updateFinalUsageMap(usage:string, nameEntityId:number, weight:number) {
        if(!this.finalUsageMap.has(usage)) {
            this.finalUsageMap.set(usage, new Map<number, number>());
        }
        // @ts-ignore
        if(!this.finalUsageMap.get(usage).has(nameEntityId)) {
            // @ts-ignore
            this.finalUsageMap.get(usage).set(nameEntityId, 0);
        }
        // @ts-ignore
        let oldWeight = this.finalUsageMap.get(usage).get(nameEntityId);
        // @ts-ignore
        this.finalUsageMap.get(usage).set(nameEntityId, oldWeight + weight);
    }
}
export default FunctionEntity;