import Entity from "./Entity"
import ImportStmt from "./ImportStmt";
import LocalName from "../uerr/LocalName";
class ModuleEntity extends Entity {
    public category = "Module";

    // private importStmts = new Set<ImportStmt>();
    private defineExportId2Str = new Map<number,string>();
    private defineDefaultExportId2Str = new Map<number,string>();
    private declareExportId2Str = new Map<number,string>();
    private declareExportDefaultId2Str = new Map<number,string>();
    private importAlias =  new Map<string, number>();

    private importStmts = new Array<ImportStmt>();
    // private defineExportId2Str = new Array(new Map<number,string>());
    //exportedStr-->aliasId
    private exportAlias =  new Map<string, number>();
    private unnamed_func = new Set<number>();
    private ptrUnnamed_funcIds = new Set<number>();
    //init form of functioncalls
    public calledFuncOrCls = new Set<string>();
    private calledFuncOrClsId = new Set<number>();
    private calledNewFunc = new Set<string>();
    private calledNewFuncArr = new Array<string>();
    private calledNewFuncId = new Set<number>();
    //private HashMap<String, Integer> calledWeightedFunctions = new HashMap<String, Integer>();
    //private localNames = new Set<LocalName>(); //the initial Names appear in a function
    private localNames = new Set<LocalName>(); //the initial Names appear in a function
    private importedId2Indexs = new Map<number, number>(); //[importedId, aboveIndex]
    protected name2IdMap = new Map<string, number>(); //map from the usedName inside module into the entityId.
    //local name -> role (parameter, return , globalvar, localVar, function, package)
    protected code = new Set<string>();
    protected codeMap = new Array<string>();
    //local name -> usage (set, use)
    private nameMap = new Map<string, Set<string>>();
    private obj = Object.create(null);
    protected name2Usage = new Set<Map<string, Set<string>>>();
    //store the final usagewithweight ("usage", (nameEntityId, weight))/
    private finalUsageMap = new Map<String, Map<number, number>>();
    private protoDefined = new Set<string>();
    private protoDefinedArr = new Array<string>();
    private instanceNames = new Set<string>();
    // private classDefinition = new Array<string>();

    constructor( moduleId: number, moduleName: string) {
        super();
        this.id = moduleId;
        this.simpleName = moduleName;
    }


    getModuleSimpleName() {
        return this.simpleName;
    }

    getCategory() {
        return this.category;
    }

    getCalledFuncOrCls() {
        return this.calledFuncOrCls;
    }

    addFuncOrClsCall(calleeStr:string) {
        this.calledFuncOrCls.add(calleeStr);
    }

    addCalledFuncOrClsId(id:number){
        this.calledFuncOrClsId.add(id);
    }

    getCalledFuncOrClsId(){
        return this.calledFuncOrClsId;
    }

    setCalledFunctions(calledFunctions:Set<string>) {
        this.calledFuncOrCls.clear();
        for (let entry of calledFunctions) {
            this.calledFuncOrCls.add(entry); // 1, "string", false
        }
    }

    setCalledNewFuncs(calledNewFunctions:Set<string>) {
        this.calledNewFunc.clear();
        for (let entry of calledNewFunctions) {
            this.calledNewFunc.add(entry); // 1, "string", false
        }
    }

    addUnNamed_FuncId(id:number){
        this.unnamed_func.add(id);
    }

    getUnNamed_FuncId(){
        return this.unnamed_func.size;
    }

    addPtrUnnamed_funcIds(id:number){
        this.ptrUnnamed_funcIds.add(id);
    }

    getPtrUnnamed_funcIds(){
        return this.ptrUnnamed_funcIds;
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

    addCallNewFuncOrClsId(id:number){
        this.calledNewFuncId.add(id);
    }

    getCallNewFuncOrClsId(){
        return this.calledNewFuncId;
    }

    addLocalName(localName:LocalName) {
        this.localNames.add(localName);
    }

    getLocalNames(){
        return this.localNames;
    }

    getImportStmts() {
        return this.importStmts;
    }

    // addImportStmt(stmt:ImportStmt) {
    //     this.importStmts.add(stmt);
    // }

    // addImportStmts(stmts:Set<ImportStmt>) {
    //     for (let stmt of stmts) {
    //         this.importStmts.add(stmt); // 1, "string", false
    //     }
    // }

    addImportStmts(stmts:Set<ImportStmt>) {
        for (let stmt of stmts) {
            this.importStmts.push(stmt); // 1, "string", false
        }
    }

    addImport(oneImport:[string,string]) {
        // @ts-ignore
        this.imports.push(oneImport);
    }


    addDefineExportId2Str(id:number,str:string){
        // let temp = new Map();
        // temp.set(id,str);
        // this.defineExportId2Str.push(temp)
        this.defineExportId2Str.set(id,str);
    }

    getDefineExportId2Str() {
        return this.defineExportId2Str;
    }

    addDefineDefaultExportId2Str(id:number,str:string){
        this.defineDefaultExportId2Str.set(id,str);
    }

    getDefineDefaultExportId2Str() {
        return this.defineDefaultExportId2Str;
    }

    getImportsAlias() {
        return this.importAlias;
    }

    addImportAlias(exportedStr:string, aliasId:number) {
        this.importAlias.set(exportedStr, aliasId);
    }

    getExportAlias() {
        return this.exportAlias;
    }

    addExportAlias(exportedStr:string, aliasId:number) {
        this.exportAlias.set(exportedStr, aliasId);
    }

    updateImportedId2Indexs(importedId:number, index:number)  {
        this.importedId2Indexs.set(importedId, index);
    }

    getImportedId2Indexs() {
        return this.importedId2Indexs;
    }

    addDeclareExportId2Str(id:number,str:string){
        this.declareExportId2Str.set(id,str);
    }

    getDeclareExportId2Str() {
        return this.declareExportId2Str;
    }

    // addDeclareExportStr(str:string){
    //     this.declareExportStr.add(str);
    // }

    // getDeclareExportStr(){
    //     return this.declareExportStr;
    // }

    // addDeclareExportStrId(id:number){
    //     this.declareExportId.add(id);
    // }


    addDeclareExportDefaultId2Str(id:number,str:string){
        this.declareExportDefaultId2Str.set(id,str);
    }

    getDeclareExportDefaultId2Str() {
        return this.declareExportDefaultId2Str;
    }

    // addDeclareExportDefaultStr(str:string){
    //     this.declareExportDefaultStr.add(str);
    // }
    //
    // getDeclareExportDefaultStr(){
    //     return this.declareExportDefaultStr;
    // }
    //
    // addDeclareExportDefaultId(id:number){
    //     this.declareExportDefaultId.add(id);
    // }


    getFinalUsageMap() {
        return this.finalUsageMap;
    }

    getName2IdMap() {
        return this.name2IdMap;
    }

    // getName2RoleMap() {
    //     return this.name2RoleMap;
    // }
    //
    // addName2Role(name:string, role:string) {
    //     if(!this.name2RoleMap.has(name)) {
    //         this.name2RoleMap.set(name, role);
    //     }
    // }


    addName2Id(name:string, id:number) {
        if(!this.name2IdMap.has(name)) {
            this.name2IdMap.set(name, id);
        }
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
        this.name2Usage.add(tempMap);
    }

    map2Obj(map:Map<string, Set<string>>) {
        map.forEach((value, key, map) =>{
            this.obj[key] = [...value];
        })
        return this.obj;
    }

    getProtoDefined() {
        return this.protoDefinedArr;
    }

    addProtoDefined(name:string){
        this.protoDefined.add(name);
        this.protoDefinedArr = Array.from(this.protoDefined)
    }

    getInstanceNames() {
        return this.instanceNames;
    }

    addInstanceNames(name:string){
        this.instanceNames.add(name);
    }

    // getClassType() {
    //     return this.classDefinition;
    // }

    getCode() {
        return this.codeMap;
    }


    addCode(code:string) {
       // 添加时对codemap先过滤处理
        code = this.filterCode(code)
        if(code !== "") {
            this.code.add(code);
        }
        this.codeMap = [...this.code];
    }
    // adId2Code(id:number, code:string) {
    //     if(!this.id2Code.has(id)) {
    //         this.id2Code.set(id, code);
    //     }
    // }

    filterCode(code:string) {
        if(code.endsWith(";")) {
            code = code.split(";")[0]
        }
        // if(code == '[]' || /^[a-zA-Z]+$/.test(code) || /\d/.test(code) || code.trim().startsWith("return") || code.trim().startsWith("const")
        //     || code.trim().startsWith("let") || code.trim().startsWith("var")) {
        //     code = ''
        // }
        if(code == '[]' || /^[a-zA-Z]+$/.test(code)|| code.trim().includes("return") || code.trim().includes("const")
            || code.trim().includes("let") || code.trim().includes("var")) {
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
export default ModuleEntity;