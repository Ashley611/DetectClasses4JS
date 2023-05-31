import pathUtil from "../utils/PathUtil";
import RelationTuple from "../utils/RelationTuple";
class Entity{
    public id = -1;
    // public id = "";
    public simpleName = "";
    public qualifiedName = "";
    public parentId = -1;
    public childrenIds = new Array<number>();
    // public childrenIds = new Set<number>();
    //public relations = new Set<RelationTuple<string, number>>();
    // public childrenIds = new Array<number>();
    public relations = new Array<RelationTuple<string, number>>();
    private inferType = new Array<string>();


    getInferType() {
        return this.inferType;
    }

    setInferType(type:string) {
        this.inferType.push(type);
    }

    getQualifiedName() {
        return this.qualifiedName;
    }

    setQualifiedName(name:string) {
        this.qualifiedName = name;
    }

    getSimpleName() {
        return this.simpleName;
    }

    setSimpleName(name:string) {
        this.simpleName = name;
    }

    getId() {
        return this.id;
    }

    setId(id:number) {
        this.id = id;
    }

    // setId(id:string) {
    //     this.id = id;
    // }

    getParentId() {
        return this.parentId;
    }

    setParentId(parentId:number) {
        this.parentId = parentId;
    }

    // addChildId (id:number){
    //     this.childrenIds.add(id);
    // }
    addChildId (id:number){
        this.childrenIds.push(id);
    }

    getChildrenIds() {
        return this.childrenIds;
    }

    // addRelation(tuple:[string,number]) {
    //      // @ts-ignore
    //      this.relations.add(tuple);
    // }
    addRelation(tuple:[string,number]) {
        // @ts-ignore
        this.relations.push(tuple);
    }

    addRelations(relations:[string,number]) {
        // @ts-ignore
        this.relations.add(relations);
    }

    getRelations() {
        return this.relations;
    }

}
export default Entity;





