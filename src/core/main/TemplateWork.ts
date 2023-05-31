import Configure from "../utils/Configure";
import {close, read_Line} from "./read";
import EntityBuilder from "../visitors/entityVisitor/EntityBuilder";
import DepLyzer from "../visitors/depVisitor/DepLyzer";
import Formator from "../formator/Formator";
import WriterIntf from "../writer/WriterIntf";
import SingleCollect from "../utils/SingleCollect";
import entityNodeObject from "../formator/fjson_ArangoDB/EntityNodeObject";
import JCellObject from "../formator/fjson/JCellObject";
import FunctionEntity from "../entities/FunctionEntity";
import ClassEntity from "../entities/ClassEntity";
import MethodEntity from "../entities/MethodEntity";
import VarEntity from "../entities/VarEntity";

class TemplateWork{
    configure = Configure.getConfigureInstance();
    singleCollect = SingleCollect.getSingleCollectInstance()
    workflow(args:Array<string>){
        let lang = args[0];
        let inputDir = args[1];
        let usageDir = args[2];
        let projectName = usageDir;
        let depMask = "1111111111111111";
        let tempArg = [];
        for(let i=0;i<args.length;i++){
            if(args[i] !==undefined && args[i] !=="."){
                tempArg.push(args[i]);
            }
        }
        if(tempArg.length < 2) {
            console.log("Not enough parameters!");
            return;
        }

        if(args[0] !== 'JavaScript' && args[0] !== 'javascript') {
            console.log("Not support this language: " + args[0]);
            return;
        }
        if (args.length > 3) {
            projectName = args[3];
        }
        if (args.length > 4) {
            depMask = args[4];
        }
        this.config(lang, inputDir, usageDir, projectName);
        let depTypes = this.getDepType(depMask);
        this.readAndParse(inputDir);

        let formator = new Formator(depTypes);
        let jDepObject = formator.getfJsonDataModel();
        //这里把jDepObject的variables处理成对象
        // let nodeArr = this.processNodeObject(jDepObject.getVariables());

        let writer = new WriterIntf(args[1]);
        writer.run(jDepObject);
        //导入arangoDB的edge
        //writer.runCellObject(jDepObject.getCells());
        //导入arangoDB的node
        //writer.runNodeObject(nodeArr);
    }

    config(lang:string, inputDir:string, usageDir:string, projectName:string) {
        this.configure.setLang(lang);
        this.configure.setInputSrcPath(inputDir);
        this.configure.setUsageSrcPath(usageDir);
        this.configure.setAnalyzedProjectName(projectName);
        this.configure.setDefault();
    }

    processNodeObject(nodeObject:Array<string>){
        let entityNodeObjects = new Array();
        let index = 0;
        for(let nodeName of nodeObject){
            let entityNodeObj = new entityNodeObject();
            entityNodeObj.set_key(index.toString());
            entityNodeObj.setName(nodeName);
            index++;
            entityNodeObjects.push(entityNodeObj)
        }
        return entityNodeObjects;
    }

    readAndParse(inputDir:string){
        let startTime = Date.now();
        let entityBuilder = new EntityBuilder(inputDir);
        entityBuilder.run();

        let depLyzer = new DepLyzer();
        depLyzer.identifyDeps();

        let endTime = Date.now();
        console.log("耗时："+(endTime - startTime));
        }

    getDepType(depMask:string){
        let depStrs = new Set<string>();
        let charArray = depMask.split("");
        for (let i = 0; i < charArray.length; i++) {
            if (charArray[i] == '1') {
                if (i == 0) {
                    depStrs.add(Configure.RELATION_IMPORT);
                } else if (i == 1) {
                    depStrs.add(Configure.RELATION_IMPORTFROM);
                } else if (i == 2) {
                    depStrs.add(Configure.RELATION_DEFINE);
                } else if (i == 3) {
                    depStrs.add(Configure.RELATION_CALL);
                } else if (i == 4) {
                    depStrs.add(Configure.RELATION_CALL_NEW);
                } else if (i == 5) {
                    depStrs.add(Configure.RELATION_CALLPOINTER);
                } else if (i == 6) {
                    depStrs.add(Configure.RELATION_EXTEND);
                } else if (i == 7) {
                    depStrs.add(Configure.RELATION_SET);
                } else if (i == 8) {
                    depStrs.add(Configure.RELATION_USE);
                } else if (i == 9) {
                    depStrs.add(Configure.RELATION_INIT);
                } else if (i == 10) {
                    depStrs.add(Configure.RELATION_MODIFY);
                } else if (i == 11) {
                    depStrs.add(Configure.RELATION_DEFINEEXPORT);
                } else if (i == 12) {
                    depStrs.add(Configure.RELATION_DECLAREEXPORT);
                } else if (i == 13) {
                    depStrs.add(Configure.RELATION_DEFINESET);
                } else if (i == 14) {
                    depStrs.add(Configure.RELATION_DEFINEDEFAULTEXPORT);
                }else if (i == 15) {
                    depStrs.add(Configure.RELATION_ALIAS);
                }
            }
        }
        let depStrArr = Array.from(depStrs)
        //let depStrArr = depStrs.toArray(new String[depStrs.size()]);
         return depStrArr;
    }
}
export default TemplateWork;