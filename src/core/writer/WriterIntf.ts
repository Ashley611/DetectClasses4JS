import Configure from "../utils/Configure";
import JDepObject from "../formator/fjson/JDepObject";
import JsonWriter from "./JsonWriter";
import JCellObject from "../formator/fjson/JCellObject";

class WriterIntf{
    configure = Configure.getConfigureInstance();
    private fileFullPath;
    constructor(fileFullPath:string) {
        this.fileFullPath = fileFullPath;
    }

    run(jDepObject:JDepObject){
        //output data by writers
        //读取一下路径
        let jsonWriter = new JsonWriter();
        jsonWriter.toJson(jDepObject, this.configure.getOutputJsonFile(),this.fileFullPath);
        //jsonWriter.toJson(jDepObject, "outputJsonFile",this.fileFullPath);
        console.log("Export "+ this.configure.getOutputJsonFile());
    }

    runCellObject(cellObject:Array<Set<Map<string,number>>>){
        let jsonWriter = new JsonWriter();
        jsonWriter.toJson(cellObject, this.configure.getOutputEdgeJsonFile(),this.fileFullPath);
        console.log("Export "+ this.configure.getOutputEdgeJsonFile());
    }

    runNodeObject(nodeArr:Array<Set<Map<string,number>>>){
        let jsonWriter = new JsonWriter();
        jsonWriter.toJson(nodeArr, this.configure.getOutputNodeJsonFile(),this.fileFullPath);
        console.log("Export "+ this.configure.getOutputNodeJsonFile());
    }
}
export default  WriterIntf