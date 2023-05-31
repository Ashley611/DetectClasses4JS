import {readFileList} from "../../utils/FileUtil";
import FileParser from "./FileParser";

class EntityBuilder{
    private projectPath;

    constructor(project_Path:string) {
        this.projectPath = project_Path;
    }

    run(){
        let file_path:any;
        let count=0;
        let pathList = readFileList(this.projectPath);
        for(file_path of pathList){
            count++;
            this.setTree(file_path);
        }
    }

    setTree(filePath:string){
        let fileParser = new FileParser(filePath);
        return fileParser.parseOneFile()
    }
}
export default EntityBuilder;