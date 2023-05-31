import JCellObject from "./JCellObject";

class JDepObject{
    private schemaVersion = "";
    private classInfo = new Array<Object>();
    private name = "";
    //private variables = new Set<string>();
    private variables = new Array();
    //private cells = new Set<JCellObject>();
    private cells = new Array();
    private categories = new Array();
    private entityNum = new Array();


    getName() {
        return this.name;
    }

    setName(name:string) {
        this.name = name;
    }

    getSchemaVersion() {
        return this.schemaVersion;
    }

    setSchemaVersion(schemaVersion:string) {
        this.schemaVersion = schemaVersion;
    }

    getClassInfo() {
        return this.classInfo;
    }

    setClassInfo(cls_info:Array<Object>) {
        this.classInfo = cls_info;
    }

    getVariables() {
        return this.variables;
    }

    setVariables(variables:Array<object>) {
        this.variables = variables;
    }
    // setVariables(variables:Set<string>) {
    //     this.variables = variables;
    // }

    getCells(){
        return this.cells;
    }


    // setCells(cells:Set<JCellObject> ) {
    //     this.cells = cells;
    // }
    setCells(str:Array<object>){
        this.cells = str;
    }

    getEntityNum() {
        return this.entityNum;
    }

    setEntityNum(num:Array<object>) {
        this.entityNum = num;
    }

    getCategory() {
        return this.categories;
    }

    setCategory(category:Array<object>) {
        this.categories = category;
    }
}
export default JDepObject