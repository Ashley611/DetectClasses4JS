import Entity from "./Entity";

class ParameterEntity extends Entity{
    public category = "Parameter";
    constructor(id:number,paraName:string) {
        super();
        this.id = id;
        this.simpleName = paraName;
    }

    getCategory() {
        return this.category;
    }

}
export default ParameterEntity;