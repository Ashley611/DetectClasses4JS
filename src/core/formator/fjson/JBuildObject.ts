import MapObject from "../MapObject";
import Configure from "../../utils/Configure";
import JCellObject from "./JCellObject";
import JDepObject from "./JDepObject";
import PackageEntity from "../../entities/PackageEntity";
import ModuleEntity from "../../entities/ModuleEntity";
import VarEntity from "../../entities/VarEntity";
import FunctionEntity from "../../entities/FunctionEntity";
import PropertyEntity from "../../entities/PropertyEntity";
import MethodEntity from "../../entities/MethodEntity";
import ClassEntity from "../../entities/ClassEntity";
import Relation from "../../uerr/Relation";
import JsRelationInfo from "../../visitors/JsRelationInfo";

class JBuildObject{
    configure = Configure.getConfigureInstance();
    relation = new Relation();

    buildObjectProcess(mapObject:MapObject){
        let files = mapObject.getFiles();
        let entities = mapObject.getAllEntities();
        let finalRes = mapObject.getFinalRes();
        let enNums = mapObject.getEntityNums();

        //console.log(finalRes)
        let cellObjects = this.buildCellObjects(finalRes); //transform finalRes into cellObjects
        // let ctgObjects = this.buildCtgArr();
        // let enNumObjects = this.buildEnNums(enNums);


        let depObject = new JDepObject();
        let arr = new Array();
        // for(let file of files){
        //     arr.push(file)
        // }

        for(let entity of entities){
            //保留最终需要展示的字段
            entity = this.processEnJson(entity);
            //这里的entity包含了很多中间字段
            arr.push(entity)
        }

        depObject.setVariables(arr);
        depObject.setName(this.configure.getAttributeName());
        depObject.setSchemaVersion(this.configure.getSchemaVersion());
        //relationInfo中的classType信息
        depObject.setClassInfo(this.relation.getClassTypeInfo());
        // depObject.setUserDefined()
        // depObject.setCategory(ctgObjects);
        // depObject.setEntityNum(enNumObjects);

        arr = [];
        for(let cell of cellObjects){
            arr.push(cell)
        }
        depObject.setCells(arr);
        return depObject;
    }

    processEnJson(entity:any) {
        let obj:any = {};
        obj.id = entity.getId();
        obj.simpleName = entity.getSimpleName();
        obj.qualifiedName = entity.getQualifiedName();
        obj.parentId = entity.getParentId();
        // obj.childrenIds = entity.getChildrenIds();
        obj.relations = entity.getRelations();
        obj.inferType = entity.getInferType();
        obj.category = entity.getCategory();
        if(entity instanceof PackageEntity){
            obj.fullPath = entity.getFullPath();
        }
        if(entity instanceof ModuleEntity){
            obj.usage = [...entity.getName2UsageMap()];
            obj.useCode = entity.getCode();
        }
        if(entity instanceof ClassEntity){
            obj.codeSnippet = entity.getCodeSnippet();
            obj.kind = entity.getKind();
            obj.loc = entity.getLoc();
            obj.isExported = entity.getIsExported();
            obj.superClass = entity.getSuperClass();
        }
        if(entity instanceof MethodEntity){
            obj.codeSnippet = entity.getCodeSnippet();
            obj.loc = entity.getLoc();
            obj.static = entity.getStatic();
            obj.isConstructor = entity.getConstructor();
            obj.instance = Array.from(entity.getInstanceNames());
            obj.callNew = entity.getCalledNewFunc();
            obj.returns = [...entity.getReturns()];
            obj.generator = entity.getGenerator();
            obj.async = entity.getAsync();
            obj.classDefinition = entity.getClassType();
            obj.param = entity.getParams();
            obj.usage = [...entity.getName2UsageMap()];
            obj.useCode = entity.getCode();
        }
        if(entity instanceof VarEntity){
            obj.codeSnippet = entity.getCodeSnippet();
            obj.loc = entity.getLoc();
            obj.kind = entity.getKind();
            obj.initType = entity.getInitType();
        }
        if(entity instanceof FunctionEntity){
            obj.pureName = entity.getPureName();
            obj.instance = Array.from(entity.getInstanceNames());
            obj.isArrow = entity.getIsArrow();
            obj.call_apply = Array.from(entity.getCallApply());
            obj.codeSnippet = entity.getCodeSnippet();
            obj.loc = entity.getLoc();
            obj.callNew = entity.getCalledNewFunc();
            obj.returns = [...entity.getReturns()];
            obj.classDefinition = entity.getClassType();
            obj.param = entity.getParams();
            obj.usage = [...entity.getName2UsageMap()];
            obj.useCode = entity.getCode();


            // console.log(obj.returns)
            // obj.innerLocs = entity.getInnerLoc();
            // obj.generator = entity.getGenerator();
            // obj.async = entity.getAsync();
        }
        if(entity instanceof PropertyEntity){
            obj.codeSnippet = entity.getCodeSnippet();
            obj.loc = entity.getLoc();
            obj.static = entity.getStatic();
        }
        return obj;
    }

    buildCellObjects(finalRes:Map<number, Map<number, Map<string, number>>> ) {
        let cellObjects = new Set<JCellObject>();
        finalRes.forEach((value, key, map) =>{
            //这里本来为number,暂时转换为string
            let src = key;
            let values1 = value;
            values1.forEach((value, key, map) =>{
                let dst = key;
                let values2 = value;
                let valueObject = this.buildValueObject(values2);
                let cellObject = new JCellObject();

                //src不保存为var下标，保存为 项目名/下标
                let projectName = this.configure.getAnalyzedProjectName().split('\\')[1];
                // cellObject.setSrc(projectName +"/"+ src);
                // cellObject.setDest(projectName+ "/" +dst);
                cellObject.setSrc(src);
                cellObject.setDest(dst);
                let obj = this.mapToObj(valueObject);
                cellObject.setValues(obj);
                cellObjects.add(cellObject);
            })
        })
            return cellObjects;
    }

    mapToObj(map:Map<string,number>){
        let obj= Object.create(null);
        map.forEach(function (value, key, map){
            obj[key] = value;
        })
        return obj;
    }

    buildCtgArr() {
        let ctgArr = new Array();
        ctgArr.push({"name":"Module"});
        ctgArr.push({"name":"Function"});
        ctgArr.push({"name":"Class"});
        ctgArr.push({"name":"Method"});
        ctgArr.push({"name":"Variable"});
        ctgArr.push({"name":"Parameter"});
        ctgArr.push({"name":"Property"});
        ctgArr.push({"name":"PreDefinedObject"});
        return ctgArr;
    }

    buildEnNums(enNumsObj:Map<string,number>) {
        //console.log(enNumsObj)
        let numsArr = new Array();
        let numsObj = this.mapToObj(enNumsObj);
        numsArr.push(numsObj)
        return numsArr;
    }

    buildValueObject(values2:Map<string, number> ) {
        let valueObject = new Map<string, number>();
        values2.forEach(function (value, key, map){
            let depType = key;
            let weight = value;
            valueObject.set(depType, weight);
        })
         return valueObject;
    }
}
export default JBuildObject;