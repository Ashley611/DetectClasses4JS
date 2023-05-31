import Entity from "./Entity";
import LocalName from "../uerr/LocalName";

class MethodEntity extends Entity{
    //protected returnType = "";
    public category = "Method";
    private codeSnippet = "";
    private loc = "";
    //protected returnExpression = "";
    protected isConstructor = false;
    private static = false;
    private generator = false;
    private async = false;
    private pureName = "";
    public calledFunc = new Set<string>();
    private calledNewFunc = new Set<string>();
    private calledNewFuncArr = new Array<string>()
    private unnamed_funcIds = new Set<number>();
    private possiblePointer = new Set<string>();
    private parameters = new Map();
    private params = new Array<[]>();
    private paramIds = new Set<number>();
    private innerLoc = new Array<string>();
    private returns = new Array<string>();
    private returnLoc = new Array<string>()
    protected localNames = new Set<LocalName>(); //the initial Names appear in a function
    protected name2IdMap = new Map<string, number>(); //map from the usedName inside function into the entityId.
    // protected id2Code = new Map<number, string>();
    // protected name2Usage = new Map<string, Set<string>>();
    protected code = new Set<string>();
    protected codeMap = new Array<string>();
    private nameMap = new Map<string, Set<string>>();
    private obj = Object.create(null);
    protected name2Usage = new Set<Map<string, Set<string>>>();
    //store the final usagewithweight ("usage", (nameEntityId, weight))/
    private finalUsageMap = new Map<string, Map<number, number>>();
    private classDefinition = new Array<string>();
    private thisBinding = false;
    private protoDefined = new Set<string>();
    private protoDefinedArr = new Array<string>();
    private call_apply = new Set<string>();
    private instanceNames = new Set<string>();
    private methodFlag = "";


    constructor(methodId:number, methodName:string){
        super();
        this.id = methodId;
        this.simpleName = methodName;
    }

    initParameters(id:number, pure_name:string, name:string, useSeq:[]) {
        this.parameters.set("id",id);
        this.parameters.set("pureName",pure_name);
        this.parameters.set("name",name);
        this.parameters.set("useSeq",useSeq);
        let tempPara = this.mapToObj(this.parameters);
        this.addParams(tempPara);
    }

    mapToObj(map:Map<string,number>){
        let obj= Object.create(null);
        map.forEach(function (value, key, map){
            obj[key] = value;
        })
        return obj;
    }

    getCodeSnippet() {
        return this.codeSnippet;
    }

    // setReturnType(type:string){
    //     this.returnType = type;
    // }
    //
    // getReturnType(){
    //     return this.returnType;
    // }

    addParamIds(paramId:number) {
        this.paramIds.add(paramId);
    }

    getParameters() {
        return this.paramIds;
    }

    getCategory() {
        return this.category;
    }

    setStatic(stat:boolean){
        this.static = stat;
    }

    getStatic(){
        return this.static;
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

    getPureName() {
        return this.pureName;
    }

    setPureName(pureName:string) {
        this.pureName = pureName;
    }
    // setReturnExpression(expression:string){
    //    this.returnExpression = expression;
    // }
    //
    //  getReturnExpression(){
    //    return this.returnExpression;
    // }

    // addParameter(parameterId:number) {
    //     this.parameters.add(parameterId);
    // }
    //
    // getParameters() {
    //     return this.parameters;
    // }

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

    addReturns(returns:string) {
        this.returns.push(returns);
    }

    getReturns() {
        return this.returns;
    }

    addReturnLoc(loc:string) {
        this.returnLoc.push(loc);
    }

    getReturnLoc() {
        return this.returnLoc;
    }

    setLoc(loc:string) {
        this.loc = loc;
    }

    getLoc() {
        return this.loc;
    }

    setConstructor(isCons:boolean){
        this.isConstructor = isCons;
    }

    getConstructor(){
        return this.isConstructor;
    }

    is_Constructor() {
        return this.isConstructor;
    }

    addCalledFuncOrCls(functionName:string) {
        this.calledFunc.add(functionName);
    }

    setCalledFuncOrCls(calledFunctions:Set<string>) {
        this.calledFunc.clear();
        for (let entry of calledFunctions) {
            this.calledFunc.add(entry);
        }
    }

    addCallNewFunc(calleeStr:string) {
        this.calledNewFunc.add(calleeStr);
        this.calledNewFuncArr = Array.from(this.calledNewFunc)
    }

    getCalledNewFunc() {
        return this.calledNewFuncArr;
    }

    getCalledNewFuncSet() {
        return this.calledNewFunc;
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

    setCodeSnippet(codeSnippet:string) {
        this.codeSnippet = codeSnippet;
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

    getFinalUsageMap() {
        return this.finalUsageMap;
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

    getClassType() {
        return this.classDefinition;
    }

    setClassType(classType:string) {
        this.classDefinition.push(classType);
    }

    getInstanceNames() {
        return this.instanceNames;
    }

    addInstanceNames(name:string){
        this.instanceNames.add(name);
    }


    getCallApply() {
        return this.call_apply;
    }

    addCallApply(name:string){
        this.call_apply.add(name);
    }

    getMethodFlag() {
        return this.methodFlag;
    }

    setMethodFlag(flag:string){
        this.methodFlag = flag;
    }


    getName2UsageMap() {
        return this.name2Usage;
    }


    addName2Usage(name:string, usage:string) {
        if (!this.nameMap.has(name)) {
            this.nameMap.set(name, new Set<string>());
        }
        // @ts-ignore
        if(!this.nameMap.get(name).has(usage)) {
            // @ts-ignore
            this.nameMap.get(name).add(usage);
        }
        let tempMap = this.map2Obj(this.nameMap);
        this.name2Usage.add(tempMap)
    }

    map2Obj(map:Map<string, Set<string>>) {
        map.forEach((value, key, map) =>{
            this.obj[key] = [...value];
        })
        return this.obj;
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
        return code;
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
export default MethodEntity