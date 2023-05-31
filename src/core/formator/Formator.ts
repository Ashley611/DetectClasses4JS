import JBuildObject from "./fjson/JBuildObject";
import MapObject from "./MapObject";

class Formator{
    private mapObject;
    constructor(depTypes:Array<string>) {
        this.mapObject = new MapObject(depTypes);
    }

    getfJsonDataModel() {
        //console.log(this.mapObject.relation)
        let jBuildObject = new JBuildObject();
        let jDepObject = jBuildObject.buildObjectProcess(this.mapObject);
        return jDepObject;
    }
}
export default Formator;