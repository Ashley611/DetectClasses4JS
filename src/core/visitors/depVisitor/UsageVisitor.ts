import NameSearch from "../searcher/NameSearch";
import SingleCollect from "../../utils/SingleCollect";
import FunctionEntity from "../../entities/FunctionEntity";
import ModuleEntity from "../../entities/ModuleEntity";
import MethodEntity from "../../entities/MethodEntity";
import VarEntity from "../../entities/VarEntity";
import PropertyEntity from "../../entities/PropertyEntity";
import ParameterEntity from "../../entities/ParameterEntity";

class UsageVisitor{
    nameSearch = NameSearch.getNameSearchInstance();
    singleCollect = SingleCollect.getSingleCollectInstance();
    varWithSameName = new Map<string, Set<number>>();
    ids = new Set<number>();

    /**
     * build finalUsage for functions
     */
    buildUsage() {
        this.identifyPossibleUsage();
        for (let entity of this.singleCollect.getEntities()) {
            if (entity instanceof FunctionEntity || entity instanceof ModuleEntity
            || entity instanceof MethodEntity || entity instanceof VarEntity) {
                let funcOrModOrMethodId = entity.getId();
                //generate localName2IDMap
                this.findLocalName2IDForEntity(funcOrModOrMethodId);
                //use localName2IdMap and localName to build finalUsageMap
                this.buildUsageMapForEntity(funcOrModOrMethodId);
            }
        }
    }


    /**
     * find all possible usage ids with same name
     */
    identifyPossibleUsage() {
        //这里面保存的是最后一位字符相等的元素
        for (let entity of this.singleCollect.getEntities()) {
            if (entity instanceof VarEntity || entity instanceof PropertyEntity || entity instanceof ParameterEntity) {
                let name = entity.getSimpleName();
                if(name !== undefined && name.includes(".")){
                    let arr = name.split(".");
                    name = arr[arr.length-1];
                    if (!this.varWithSameName.has(name)) {
                        this.varWithSameName.set(name, new Set<number>());
                    }
                    // @ts-ignore
                    this.varWithSameName.get(name).add(entity.getId());
                }
            }
        }
        //console.log(this.varWithSameName)
    }

    /**
     * for one functionEntity, find entityIds for the localNames
     * @param id
     */
    findLocalName2IDForEntity(id:number) {
        let localName;
        let localNameEntityId;
        let entity = (Array.from(this.singleCollect.getEntities()))[id];
        if(entity instanceof FunctionEntity || entity instanceof ModuleEntity
            || entity instanceof MethodEntity || entity instanceof VarEntity) {
            for (let localNameObject of (entity.getLocalNames())){
                localName = localNameObject.getName();
                this.searchNameInScope(localName, id);
                //localNameEntityId = this.searchNameInScope(localName, id);
                //localNameEntityId = this.searchNameInScope(localName, id);
                // console.log(localNameEntityId)
                // if(localNameEntityId !== undefined){
                //     for(let localNameId of localNameEntityId){
                //         entity.getName2IdMap().set(localName,localNameId);
                //     }
                //    // entity.getName2IdMap().set(localName,localNameEntityId);
                // }
                //console.log(entity.getName2IdMap())
            }
        }
    }

    searchNameInScope(localName:string, scopeId:number){
        //传入的是父类Id和它的localName
        //传入的localName应该加上父类的简单名，和父类名去找，看父类名下是否包含这个localName
        let localNameId;
        let entity = (Array.from(this.singleCollect.getEntities()))[scopeId];
        if (localName != "") {
            if(localName.includes(".")){
                let originLocalName = localName;
                let temp= localName.split(".");
                localName = temp[temp.length-1];
                let possibleUsageIds = this.searchPossibleUsage(localName);
                if(possibleUsageIds !== undefined){
                    for(let possibleId of possibleUsageIds){
                       entity.getName2IdMap().set(originLocalName,possibleId);
                    }
                }
                //let ids = new Set<number>();
                // let newLocalName = this.modifyLocalName(localName);
                // for(let i = 0; i< newLocalName.length;i++){
                //     //console.log(newLocalName)
                //     //对修改后的每个字符判断是不是含点，a, a.b, a.b.c
                //     if(!(newLocalName[i].includes("."))){
                //         //父类名加上这个名字，在父类的nameMap下找
                //         scopeId = this.findWithOutDotUsage(newLocalName[i],scopeId);
                //         if(scopeId !== -1 && scopeId !== undefined){
                //             localNameId = scopeId;
                //         }
                //         entity.getName2IdMap().set(newLocalName[i],localNameId);
                //         //console.log(entity.getName2IdMap())
                //     }else{
                //         let tempArr = newLocalName[i].split(".");
                //         let localName = tempArr[tempArr.length-1];
                //         //直接传入localName在possibleUse下找，找到就是scopeId与这个发生了use
                //         // @ts-ignore
                //         ids = this.searchPossibleUsage(localName);
                //         if(ids !== undefined){
                //             for(let possibleId of ids){
                //                entity.getName2IdMap().set(newLocalName[i],possibleId);
                //             }
                //         }
                //     }
                // }
            } else if(!(localName.includes("."))){
                //不含点的，遍历scope的children找localNameId
                scopeId = this.findWithOutDotUsage(localName,scopeId);
                if(scopeId !== -1){
                    localNameId = scopeId;
                }
                entity.getName2IdMap().set(localName,localNameId);
           }
        }
    }

    searchPossibleUsage(localName:string){
        let ids = new Set<number>();
        if(this.varWithSameName.has(localName)) {
            return this.varWithSameName.get(localName);
        }
        return ids;
    }

    findWithOutDotUsage(localName:string,scopeId:number){
        let entity = (Array.from(this.singleCollect.getEntities()))[scopeId];
        if(entity instanceof ModuleEntity){
            localName = localName;
        }else{
            localName = entity.getSimpleName() + "." +localName;
        }
        let nameMap = this.nameSearch.getNameMapOfScope(scopeId);
        if(nameMap !== null){
            // @ts-ignore
            nameMap.forEach(function (value, key, map){
                if(key == localName){
                    scopeId = value;
                }
            })
            return scopeId;
        }
        return -1;
    }

    modifyLocalName(localName:string){
        let temp = [] ;
        if(localName.includes(".")){
            let arr = localName.split(".");
            for (let index = 0; index < arr.length; index++) {
                //a.m.d  arr=[a,m,d]
                let pre = "";
                if(index != 0) {
                    for (let i = 0; i < index; i++) {
                        pre += arr[i];
                        pre += ".";
                    }
                }
                let newStr = pre + arr[index];
                temp.push(newStr);
            }
            return temp;
        }else{
            temp.push(localName);
            return temp;
        }
    }


    /**
     * for one functionEntity, build its final usage map
     * @param id
     */
    buildUsageMapForEntity(id:number) {
        //前面对a.b.c每部分都找了id,但在这里只对完整的localName建立了usageMap
        let localNames = null;
        let name2IdMap = null;
        let usage:any;
        let weight;
        let entity = (Array.from(this.singleCollect.getEntities()))[id];
        if(entity instanceof FunctionEntity || entity instanceof ModuleEntity
        || entity instanceof MethodEntity || entity instanceof VarEntity) {
            localNames = entity.getLocalNames();
            //console.log(localNames)
            name2IdMap = entity.getName2IdMap();
            //console.log(name2IdMap)
        }
        if(localNames == null || name2IdMap == null) {
            return;
        }

        for(let localName of localNames) {
            let localNameId = name2IdMap.get(localName.getName());
            if(localNameId == -1) {
                continue;
            }
            //console.log(localName.getWeightedUsages())
            localName.getWeightedUsages().forEach((value , key)=>{
                 usage = key;
                 weight = value;
                if(entity instanceof FunctionEntity || entity instanceof ModuleEntity
                || entity instanceof MethodEntity) {
                    // @ts-ignore
                    entity.updateFinalUsageMap(usage, localNameId, weight);
                    //console.log(entity.getFinalUsageMap())
                }
            });
        }
    }
}
export default UsageVisitor;