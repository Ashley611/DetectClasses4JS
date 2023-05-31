import Entity from "./Entity";
import pathUtil from "../utils/PathUtil";

class PackageEntity extends Entity{

    protected fullPath:string;
    public category = "Package";

    constructor(id:number, name:string, fullPath:string) {
        super()
        this.id = id;
        this.qualifiedName = name;
        this.fullPath = fullPath;
    }

    getCategory() {
        return this.category;
    }

    setSimpleName() {
        let elements = this.getQualifiedName().split(".");
        this.simpleName = elements[elements.length-1];
    }

    setFullPath(fullPath:string) {
        this.fullPath = fullPath;
    }

    getFullPath() {
        return this.fullPath;
    }

}

export default PackageEntity