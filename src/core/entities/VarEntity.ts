import Entity from "./Entity"
import LocalName from "../uerr/LocalName";
class VarEntity extends Entity{
    //private type;
    public category = "Variable";
    private codeSnippet = "";
    private loc = "";
    private kind = "";
    private initType = "";
    protected localNames = new Set<LocalName>(); //the initial Names appear in a function
    protected name2IdMap = new Map<string, number>(); //map from the usedName inside function into the entityId
    private finalUsageMap = new Map<string, Map<number, number>>();
    private calledNewFunc = new Set<string>();
    //private value = "";

    constructor(id:number,name:string,type:string) {
        super();
        this.id = id;
        this.initType = type;
        this.simpleName = name;
    }
    getCodeSnippet() {
        return this.codeSnippet;
    }

    setCodeSnippet(codeSnippet:string) {
        this.codeSnippet = codeSnippet;
    }

    getCategory() {
        return this.category;
    }

    setLoc(loc:string) {
        this.loc = loc;
    }

    getLoc() {
        return this.loc;
    }

    // getValue() {
    //     return this.value;
    // }
    //
    // setValue(value:string) {
    //     this.value = value;
    // }

    getKind() {
        return this.kind;
    }

    setKind(kind:string) {
        this.kind = kind;
    }

    addCallNewFunc(calleeStr:string) {
        this.calledNewFunc.add(calleeStr);
    }

    getCalledNewFunc() {
        return this.calledNewFunc;
    }

    getInitType() {
        return this.initType;
    }

    setInitType(type:string){
        this.initType = type;
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
export default VarEntity;

