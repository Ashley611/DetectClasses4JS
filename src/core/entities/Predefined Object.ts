import Entity from "./Entity";

class PredefinedObjectEntity extends Entity{
    public category = "PreDefinedObject";
    constructor(id:number,name:string) {
        super();
        this.id = id;
        this.simpleName = name;
    }

    getCategory() {
        return this.category;
    }
}
export default PredefinedObjectEntity;