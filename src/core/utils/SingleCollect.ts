import PropertyEntity from "../entities/PropertyEntity";
import {type} from "os";

let FileEntity = require("../entities/ModuleEntity");
let PackageEntity = require("../entities/PackageEntity");
let ClassEntity = require("../entities/ClassEntity");
let MethodEntity = require("../entities/MethodEntity");
let VarEntity = require("../entities/VarEntity");
let FunctionEntity = require("../entities/FunctionEntity");

class SingleCollect {
    //entities' id = index
    // @ts-ignore
    entities = new Set<Entity>();

    private static singleCollectInstance = new SingleCollect();

    //package id and name that already be created
    private createdPackage = new Map<string, number>();

    //files' id and name that already be created
    createdFile = new Map();

    //collect functions with same name.
    private methodsWithSameName = new Map<string, Set<number>>();

    getEntities() {
        return this.entities;
    }

    addEntity(entity: any) {
        this.entities.add(entity);
    }

    static getSingleCollectInstance() {
        return this.singleCollectInstance;
    }

    getCurrentIndex() {
        return this.entities.size;
    }

    getCreatedPackage() {
        return this.createdPackage;
    }

    addCreatedPackage(packageId: number, packageName: string) {
        this.createdPackage.set(packageName, packageId)
    }

    getPackageId(packageName: string) {
        return <number>this.getCreatedPackage().get(packageName)
    }

    getCreatedFile() {
        return this.createdFile;
    }

    addCreatedFile(fileId: number, fileName: string) {
        this.createdFile.set(fileId, fileName);
    }

    /**
     * find all function ids with same name,
     */
    identifySameMethodName() {
        for (let entity of SingleCollect.getSingleCollectInstance().getEntities()) {
            if (entity instanceof FunctionEntity || entity instanceof MethodEntity || entity instanceof PropertyEntity
            || entity instanceof VarEntity) {
                let name = entity.getSimpleName();
                //不管保存全名还是简单名，一个个不会出现重名，只有截取简单名的最后一位，才可能是同名方法
                let arr = name.split(".");
                name = arr[arr.length-1];
                if (!this.methodsWithSameName.has(name)) {
                        this.methodsWithSameName.set(name, new Set<number>());
                    }
                    // @ts-ignore
                    this.methodsWithSameName.get(name).add(entity.getId());
                }
            }
        //console.log(this.methodsWithSameName)
        }

    /**
     * find all method or function which has functionName
     * @param functionName
     * @return
     */
    searchFunctionByName(functionName:string) {
        let ids = new Set<number>();
        if(this.methodsWithSameName.has(functionName)) {
            return this.methodsWithSameName.get(functionName);
        }
            return ids;
    }
}
export default  SingleCollect;