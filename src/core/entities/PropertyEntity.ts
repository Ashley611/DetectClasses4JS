import Entity from "./Entity";
import RelationTuple from "../utils/RelationTuple";

class PropertyEntity extends Entity{
    public category = "Property";
    private codeSnippet = "";
    private loc = "";
    private static = false;
    private calledNewFunc = new Set<string>();
    //保存valueType和value
    //private value = new RelationTuple("","");
    constructor(id:number,propName:string) {
        super();
        this.id = id;
        this.simpleName = propName;
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

    getLoc() {
        return this.loc;
    }

    setLoc(loc:string) {
        this.loc = loc;
    }

    getStatic() {
        return this.static;
    }

    setStatic(stat:boolean) {
        this.static = stat;
    }

    addCallNewFunc(calleeStr:string) {
        this.calledNewFunc.add(calleeStr);
    }

    getCalledNewFunc() {
        return this.calledNewFunc;
    }

    // getValue() {
    //     return this.value;
    // }
    //
    // setValue(value:RelationTuple<string, string>) {
    //     this.value = value;
    // }
}
export default PropertyEntity;