import Entity from "./Entity";

class ClassEntity extends Entity{
    public category = "Class";
    private codeSnippet = "";
    private kind = "";
    private loc = "";
    private isExported = false;
    private superClass = "";
    private baseClassNameList = new Set<string>();
    private baseClassIdList = new Set<number>();


    constructor(id:number,name:string,qualifiedName:string,parentId:number){
        super();
        this.id = id;
        this.simpleName = name;
        this.qualifiedName = qualifiedName;
        this.parentId = parentId;
    }

    getCategory() {
        return this.category;
    }

    getSuperClass() {
        return this.superClass
    }

    setSuperClass(superClass:string) {
        this.superClass = superClass
    }

    setCodeSnippet(codeSnippet:string) {
        this.codeSnippet = codeSnippet;
    }

    getCodeSnippet() {
        return this.codeSnippet;
    }

    setKind(kind:string) {
        this.kind = kind;
    }

    getKind() {
        return this.kind;
    }

    setLoc(loc:string) {
        this.loc = loc;
    }

    getLoc() {
        return this.loc;
    }

    setIsExported(isOrNot:boolean) {
        this.isExported = isOrNot;
    }

    getIsExported() {
        return this.isExported;
    }

    addBaseClassName(baseName:string) {
        this.baseClassNameList.add(baseName);
    }

    addBaseClassId(baseId:number) {
        this.baseClassIdList.add(baseId);
    }

    getBaseClassNameList() {
        return this.baseClassNameList;
    }

    getBaseClassIdList() {
        return this.baseClassIdList;
    }

}
export default ClassEntity