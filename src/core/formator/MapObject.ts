import Configure from "../utils/Configure";
import JsRelationInfo from "../visitors/JsRelationInfo";
import Relation from "../uerr/Relation";
import RelationTuple from "../utils/RelationTuple";
import SingleCollect from "../utils/SingleCollect";
import ModuleEntity from "../entities/ModuleEntity";
import PackageEntity from "../entities/PackageEntity";
import FunctionEntity from "../entities/FunctionEntity";
import ClassEntity from "../entities/ClassEntity";
import MethodEntity from "../entities/MethodEntity";

class MapObject{
     relation = new Relation();
     files = new Set<string>();
     entities = new Set();
     entityNum = new Map<string,number>();
     finalRes = new Map<number, Map<number, Map<string, number>>>();
     depStrs;

    singleCollect = SingleCollect.getSingleCollectInstance();
    constructor(depStrs:Array<string>) {
       this.depStrs = depStrs;
       this.init()
    }

    getFiles() {
        return this.files;
    }

    getAllEntities() {
        return this.entities;
    }

    setFiles(files:Set<string>) {
        this.files = files;
    }

    getFinalRes() {
        return this.finalRes;
    }

    setEntityNums(relation:Map<string,number>) {
        this.entityNum = relation;
    }

    getEntityNums() {
        return this.entityNum;
    }

    init() {
        let relation;
        let tempSet;
        let configure = Configure.getConfigureInstance();
        if(configure.getLang() == "JavaScript" || configure.getLang() == "javascript") {
           relation = new Relation();
        }
        else {
            console.log("Not support this language!\n");
            return;
        }
        this.files = relation.getAllFiles();
        //输出变量名集合
        //this.entities = relation.getAllEntities();
        this.entities = relation.getAllEntities();
        //把所有的实体信息写入(包含了新增字段category等)  entity的id要修改为string
        //this.entities = relation.singleCollect.entities;
        //实体的数量信息  string类型，把它转换为对象，加入到一个数组中
        this.setEntityNums(relation.getEntityInfo());
        //输出数量统计信息
        relation.getClassTypeInfo()
        relation.getRelationInfo()
        this.buildDepMap(this.files);
    }


    buildDepMap(files:Set<string>) {
        //创建实体的name2Id
        let entityName2Id =  this.buildEntityMap();
        //console.log(entityName2Id)
        let fileName2Id =  this.buildFileMap(files);
        //console.log(fileName2Id)
        for (let i = 0; i < this.depStrs.length; i++) {
            let depType = this.depStrs[i];
            //console.log(depType)
            let deps = this.relation.getDepByType("ModuleEntity", depType);
            if (deps != null){
                //this.addDepsInMap1(deps, depType, fileName2Id);
                this.addDepsInMap1(deps, depType, entityName2Id);
            }
        }
    }

    buildEntityMap(){
        let entityName2Id = new Map<string, number>();
        for(let entity of this.singleCollect.getEntities()){
            if(!(entity instanceof PackageEntity)) {
               let entityId = entity.getId();
               let name = entity.getQualifiedName();
               entityName2Id.set(name,parseInt(entityId));
            }
        }
        // for(let entity of this.singleCollect.getEntities()){
        //     if(!(entity instanceof PackageEntity)) {
        //        //如果实体不属于包，进入循环，拿到实体Id,及孩子集合，把实体Id和name先加入，再遍历孩子集合，把孩子集合id和名字加入
        //         let entityId  = entity.getId();
        //         let entityObj = Array.from(this.singleCollect.getEntities())[entityId];
        //         //这里只是当前实体的所有孩子节点加进去了
        //         entityName2Id.set(entityObj.getQualifiedName(), parseInt(entityId));
        //         for(let childrenId of entityObj.getChildrenIds()){
        //             let childObj = Array.from(this.singleCollect.getEntities())[childrenId];
        //             //entityName2Id.set(childObj.getQualifiedName(), entityId);
        //             entityName2Id.set(childObj.getQualifiedName(), childrenId);
        //         }
        //     }
        // }
        //console.log(entityName2Id)
        return entityName2Id;
    }

    buildFileMap(files:Set<string>):Map<string,number> {
        let fileName2Id = new Map<string, number>();
        let index = 0;
        for (let fileName of files) {
            fileName2Id.set(fileName, index);
            index ++;
        }
        return fileName2Id;
    }

    addDepsInMap(deps:Set<RelationTuple<string,string>>, depType:string, fileName2Id:Map<string,number>) {
        for (let dep of deps) {
            let name1 = dep.x;
            let name2 = dep.y;
            let index1 = -1;
            let index2 = -1;
            //console.log(name1+".."+name2)
            if(fileName2Id.has(name1)) {
                // @ts-ignore
                index1 = fileName2Id.get(name1);
            }
            if (fileName2Id.has(name2)) {
                // @ts-ignore
                index2 = fileName2Id.get(name2);
            }
            if(name1 == name2 || index1 == -1 || index2 == -1) {
                continue;
            }
            if(!this.finalRes.has(index1)) {
                this.finalRes.set(index1, new Map<number, Map<string, number>>());
            }
            // @ts-ignore
            if(!this.finalRes.get(index1).has(index2)) {
                // @ts-ignore
                this.finalRes.get(index1).set(index2, new Map<string, number>());
            }

            // @ts-ignore
            if(!this.finalRes.get(index1).get(index2).has(depType)) {
                // @ts-ignore
                this.finalRes.get(index1).get(index2).set(depType, 0);
            }

            // @ts-ignore
            let newWeight = this.finalRes.get(index1).get(index2).get(depType) + 1;
            // @ts-ignore
            this.finalRes.get(index1).get(index2).set(depType, newWeight);
            }
        }

    addDepsInMap1(deps:Set<RelationTuple<string,string>>, depType:string, entityName2Id:Map<string,number>) {
        //console.log(deps)
        // entityName2Id.forEach((value, key) => {
        //     if(key == "1854"){
        //         console.log(value)
        //     }
        // })
        for (let dep of deps) {
            let name1 = dep.x;
            let name2 = dep.y;
            let index1 = -1;
            let index2 = -1;
            if(entityName2Id.has(name1)) {
                // @ts-ignore
                index1 = entityName2Id.get(name1);
            }
            if (entityName2Id.has(name2)) {
                // @ts-ignore
                index2 = entityName2Id.get(name2);
            }
            if(name1 == name2 || index1 == -1 || index2 == -1) {
                continue;
            }
            if(!this.finalRes.has(index1)) {
                this.finalRes.set(index1, new Map<number, Map<string, number>>());
            }
            // @ts-ignore
            if(!this.finalRes.get(index1).has(index2)) {
                // @ts-ignore
                this.finalRes.get(index1).set(index2, new Map<string, number>());
            }
            // @ts-ignore
            if(!this.finalRes.get(index1).get(index2).has(depType)) {
                // @ts-ignore
                this.finalRes.get(index1).get(index2).set(depType, 0);
            }

            // @ts-ignore
            let newWeight = this.finalRes.get(index1).get(index2).get(depType) + 1;
            // @ts-ignore
            this.finalRes.get(index1).get(index2).set(depType, newWeight);
        }
    }
}
export default MapObject;