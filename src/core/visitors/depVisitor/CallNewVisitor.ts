import DepVisitor from "./DepVisitor";
import ModuleEntity from "../../entities/ModuleEntity";
import FunctionEntity from "../../entities/FunctionEntity";
import RelationTuple from "../../utils/RelationTuple";
import Configure from "../../utils/Configure";
import NameSearch from "../searcher/NameSearch";
import MethodEntity from "../../entities/MethodEntity";
import PropertyEntity from "../../entities/PropertyEntity";
import VarEntity from "../../entities/VarEntity";
import ProcessEntity from "../entityVisitor/ProcessEntity";
import ClassEntity from "../../entities/ClassEntity";

class CallNewVisitor extends DepVisitor {
    depVisitor = new DepVisitor();
    nameSearch = NameSearch.getNameSearchInstance();
    processEntity = new ProcessEntity();
    methodsWithSameName = new Map<string, Set<number>>();

    CallNewVisitor() {
        this.nameSearch.buildNameScope();
        //call this for search possible function calls.
        this.identifySameMethodName();
    }

    setDep(){
        this.CallNewVisitor();
        for(let entity of this.singleCollect.getEntities()){
            if(entity instanceof ModuleEntity || entity instanceof FunctionEntity
                || entity instanceof MethodEntity){
                this.setCallNewDep(entity.getId());
            }
        }
        //console.log(this.singleCollect.getEntities())
    }

    setCallNewDep(modOrFunId:number){
        this.modifyCalledNewFuncs(modOrFunId);
        let calledNewFuns = this.getCalledNewFuncs(modOrFunId);

        if(calledNewFuns == null) {
            return;
        }

        //A(), custom_pre.B(), ...
        let simplifyCalleeStrs = this.simplifyCalleeStr1(calledNewFuns);
        for(let calleeStr of simplifyCalleeStrs) {
            //case 1: new A()
            if(!(calleeStr.includes(".")) && this.countAppearNumber(calleeStr, "(") == 1
                && this.countAppearNumber(calleeStr, ")") == 1){
                calleeStr = calleeStr.split("(")[0];
                if(Configure.isBuiltInFunction(calleeStr)){
                    //内置函数
                    let id = this.processEntity.processPredefinedObject(calleeStr,modOrFunId);
                    this.depVisitor.saveRelation(modOrFunId, id, Configure.RELATION_CALL_NEW, Configure.RELATION_CALLED_NEW_BY);
                    //console.log(modOrFunId+"---"+id+"----"+Configure.RELATION_CALL_NEW+"----"+Configure.RELATION_CALLED_NEW_BY);
                }else{
                    let calleeId = this.searchCalleeRegularCase(calleeStr, modOrFunId);
                    if(calleeId !== -1 && calleeId !== undefined){
                        //判断是否为类构造器
                        this.isClass(calleeId);
                        this.depVisitor.saveRelation(modOrFunId, calleeId, Configure.RELATION_CALL_NEW, Configure.RELATION_CALLED_NEW_BY);
                        //console.log(modOrFunId+"---"+calleeId+"----"+Configure.RELATION_CALL_NEW+"----"+Configure.RELATION_CALLED_NEW_BY);
                    }
                }
            }


            //case 2: complex callNew,like new A.B();
            //2.1  能找到的可能的callNew
            //2.2  custom_pre开头的，new custom_pre.C();后面的str处理为call
            //2.3   预定义函数，如Array,Object等未处理对象
            if(calleeStr.includes(".") && this.countAppearNumber(calleeStr, "(") == 1
                && this.countAppearNumber(calleeStr, ")") == 1) {
                calleeStr = calleeStr.split("(")[0];
                let calleeId = this.searchCalleeRegularCase(calleeStr, modOrFunId);
                if(calleeId !== -1 && calleeId !== undefined){
                    this.depVisitor.saveRelation(modOrFunId, calleeId, Configure.RELATION_CALL_NEW, Configure.RELATION_CALLED_NEW_BY);
                    //console.log(modOrFunId+"---"+calleeId+"----"+Configure.RELATION_CALL_NEW+"----"+Configure.RELATION_CALLED_NEW_BY);
                }
            } else if(calleeStr.includes(".") && calleeStr.startsWith("custom_pre")){
                //所有的复合名都处理为以custom_pre开头的字符串,并且处理为call new
                calleeStr = calleeStr.replace("custom_pre.","");
                this.getRelation(calleeStr,modOrFunId);
            }
        }

        // for(let index = 0; index < calledNewFuns.size; index ++) {
        //     let simpleCalleeStr = this.simplifyCalleeStr(index, calledNewFuns);
        //     // let callNewStr = this.getFinalCallNewStr(simpleCalleeStr);
        //     //case 1: new A()
        //     if(!(simpleCalleeStr.includes(".")) && simpleCalleeStr.endsWith("()")){
        //         simpleCalleeStr = simpleCalleeStr.split("(")[0];
        //         if(Configure.isBuiltInFunction(simpleCalleeStr)){
        //             //内置函数
        //             let id = this.processEntity.processPredefinedObject(simpleCalleeStr,modOrFunId);
        //             this.depVisitor.saveRelation(modOrFunId, id, Configure.RELATION_CALL_NEW, Configure.RELATION_CALLED_NEW_BY);
        //             //console.log(modOrFunId+"---"+id+"----"+Configure.RELATION_CALL_NEW+"----"+Configure.RELATION_CALLED_NEW_BY);
        //         }else{
        //             let calleeId = this.searchCalleeRegularCase(simpleCalleeStr, modOrFunId);
        //
        //             if(calleeId !== -1 && calleeId !== undefined){
        //                 this.depVisitor.saveRelation(modOrFunId, calleeId, Configure.RELATION_CALL_NEW, Configure.RELATION_CALLED_NEW_BY);
        //                 //console.log(modOrFunId+"---"+calleeId+"----"+Configure.RELATION_CALL_NEW+"----"+Configure.RELATION_CALLED_NEW_BY);
        //             }
        //         }
        //     }
        //
        //
        //     //case 2: complex callNew,like new A.B();
        //        //2.1  能找到的可能的callNew
        //        //2.2  custom_pre开头的，new custom_pre.C();后面的str处理为call
        //        //2.3   预定义函数，如Array,Object等未处理对象
        //     if(simpleCalleeStr.includes(".") && simpleCalleeStr.endsWith("()")){
        //         let flag = "";
        //         if(simpleCalleeStr.startsWith("custom_pre")){
        //             //处理为call
        //             flag = "call";
        //             //simpleCalleeStr = simpleCalleeStr.substring(11,simpleCalleeStr.lastIndexOf("("));
        //             simpleCalleeStr = simpleCalleeStr.replace("custom_pre.","").trim();
        //             this.getRelation(simpleCalleeStr,modOrFunId,flag);
        //         }else{
        //             //处理为callNew
        //             flag = "callNew"
        //             //simpleCalleeStr = this.getFinalCallNewStr(simpleCalleeStr).split(".")[1];
        //             simpleCalleeStr = simpleCalleeStr.substring(0,simpleCalleeStr.lastIndexOf("("))
        //             this.getRelation(simpleCalleeStr,modOrFunId,flag);
        //         }
        //     }
        // }
    }

    isClass(entityId:number) {
        let entity = [...this.singleCollect.getEntities()][entityId];
        if(entity instanceof FunctionEntity || entity instanceof MethodEntity){
            if(!(entity.getClassType().includes("Instantiated"))) {
                entity.setClassType("Instantiated");
            }
        }
    }

    simplifyCalleeStr1(calledFuns:Set<string>) {
        //1.如果是A(),一个括号,并且不包含点,直接返回字符串
        //2.如果是A.b(),一个括号,包含点,直接返回字符串
        //3.A.B().C()  --->  A.B(), A.B().C()   --->  A.B(),  custom_pre.C()
        let simplifyCalleeStrs = new Set<string>();
        for(let item of calledFuns) {
            if(!(item.includes(".")) && this.countAppearNumber(item, "(") == 1
                && this.countAppearNumber(item, ")") == 1) {
                //A()
                simplifyCalleeStrs.add(item);
            } else if(item.includes(".") && (this.countAppearNumber(item, "(") >= 1
                && this.countAppearNumber(item, ")") >= 1)) {
                item.split(".(").forEach(item1 => {
                    if(item1.includes("(") && item1.includes(")") && this.countAppearNumber(item, "(") == 1
                        && this.countAppearNumber(item, ")") == 1) {
                        //A.b()
                        simplifyCalleeStrs.add(item1);
                    } else {
                        //A.B().C()
                        let newArr = item1.split(".");
                        let newStr = "custom_pre." + newArr[newArr.length-1];
                        simplifyCalleeStrs.add(newStr);
                    }
                })
            }
        }
        return simplifyCalleeStrs;
    }


    searchCalleeRegularCase(simpleCalleeStr:string, modOrFunId:number) {
        // let destStr = simpleCalleeStr.split("(")[0];
        //destStr = this.getFinalCallNewStr(destStr);
        let scopeId = -1;
        //let scopeId = modOrFunId;
        //console.log(destStr+"////////"+scopeId)

        let nameMap = this.nameSearch.getNameMapOfScope(modOrFunId);
        if(nameMap !== null){
            // @ts-ignore
            nameMap.forEach(function (value, key, map){
                if(key == simpleCalleeStr){
                    scopeId = value;
                }
            })
            //scopeId = this.nameSearch.getIdByNameInScope(destStr,scopeId);
            return scopeId;
        }
    }



    getRelation(str:string,scopeId:number){
        if(Configure.isBuiltInFunction(str)){
            //内置函数
            let id = this.processEntity.processPredefinedObject(str,scopeId);
            this.depVisitor.saveRelation(scopeId, id, Configure.RELATION_CALL_NEW, Configure.RELATION_CALLED_NEW_BY);
               // console.log(scopeId+"---"+id+"----"+Configure.RELATION_CALL_NEW+"----"+Configure.RELATION_CALLED_NEW_BY);
        }else{
            let possibleCallees = this.searchCalleeByName(str);
            if(possibleCallees !== undefined && possibleCallees.size >0){
                for (let possibleCalleeId of possibleCallees) {
                    this.depVisitor.saveRelation(scopeId, possibleCalleeId, Configure.RELATION_CALL_NEW, Configure.RELATION_CALLED_NEW_BY);
                    // console.log(scopeId+"---"+possibleCalleeId+"----"+Configure.RELATION_CALL_NEW+"----"+Configure.RELATION_CALLED_NEW_BY);
                }
            }
        }
    }

    // getRelation(str:string,scopeId:number,flag:string){
    //     if(Configure.isBuiltInFunction(str)){
    //         //内置函数
    //         let id = this.processEntity.processPredefinedObject(str,scopeId);
    //         if(flag == "call"){
    //             this.depVisitor.saveRelation(scopeId, id, Configure.RELATION_CALL, Configure.RELATION_CALLED_BY);
    //             //console.log(scopeId+"---"+id+"----"+Configure.RELATION_CALL+"----"+Configure.RELATION_CALLED_BY);
    //         }else if(flag == "callNew"){
    //             this.depVisitor.saveRelation(scopeId, id, Configure.RELATION_CALL_NEW, Configure.RELATION_CALLED_NEW_BY);
    //             //console.log(scopeId+"---"+id+"----"+Configure.RELATION_CALL_NEW+"----"+Configure.RELATION_CALLED_NEW_BY);
    //         }
    //     }else{
    //         let possibleCallees = this.searchCalleeByName(str);
    //         if(possibleCallees !== undefined && possibleCallees.size >0){
    //             for (let possibleCalleeId of possibleCallees) {
    //                 if(flag == "call"){
    //                     this.depVisitor.saveRelation(scopeId, possibleCalleeId, Configure.RELATION_POSSIBLECALL, Configure.RELATION_POSSIBLECALLED_BY);
    //                     //console.log(scopeId+"---"+possibleCalleeId+"----"+Configure.RELATION_POSSIBLECALL+"----"+Configure.RELATION_POSSIBLECALLED_BY);
    //                 }
    //                 if(flag == "callNew"){
    //                     this.depVisitor.saveRelation(scopeId, possibleCalleeId, Configure.RELATION_CALL_NEW, Configure.RELATION_CALLED_NEW_BY);
    //                     //console.log(scopeId+"---"+possibleCalleeId+"----"+Configure.RELATION_CALL_NEW+"----"+Configure.RELATION_CALLED_NEW_BY);
    //                 }
    //             }
    //         }
    //     }
    // }

    searchCalleeByName(simpleCalleeStr:string) {
        // console.log(simpleCalleeStr)
        let ids = this.searchFunctionByName(simpleCalleeStr);
        // console.log(ids)
        return ids;
    }

    searchFunctionByName(functionName:string) {
        let ids = new Set<number>();
        if(this.methodsWithSameName.has(functionName)) {
            return this.methodsWithSameName.get(functionName);
        }
        return ids;
    }

    // getFinalCallNewStr(simpleCalleeStr:string){
    //     if(simpleCalleeStr.startsWith("new")){
    //         simpleCalleeStr = simpleCalleeStr.substring(4,simpleCalleeStr.length);
    //     }
    //     if(simpleCalleeStr.startsWith("custom_pre")){
    //         return simpleCalleeStr;
    //     }
    //     return simpleCalleeStr;
    // }

    modifyCalledNewFuncs(modOrFunId:number){
        let oldCalledStrs = this.getCalledNewFuncs(modOrFunId);
        if(oldCalledStrs == null) {
            return;
        }
        let newCalledStrs = this.getNewListBySplit(oldCalledStrs);
        //console.log(newCalledStrs)
        let entity = (Array.from(this.singleCollect.getEntities()))[modOrFunId];
        if(entity instanceof FunctionEntity) {
            entity.setCalledNewFuncs(newCalledStrs);
        }
        else if(entity instanceof ModuleEntity) {
            entity.setCalledNewFuncs(newCalledStrs);
        }
    }

    getCalledNewFuncs(modOrFunId:number) {
        let calledStrs = null;
        let entity = (Array.from(this.singleCollect.getEntities()))[modOrFunId];
        if(entity instanceof FunctionEntity || entity instanceof ModuleEntity || entity instanceof MethodEntity) {
            calledStrs = entity.getCalledNewFuncSet();
        }
        // else if(entity instanceof ModuleEntity) {
        //     calledStrs = entity.getCalledNewFunc();
        // }
        // else if(entity instanceof MethodEntity) {
        //     calledStrs = entity.getCalledNewFunc();
        // }
        return calledStrs;
    }

    getNewListBySplit(oldCalledNewStrs:Set<string>){
        let newCalledStrs = new Set<string>();
        for(let callee of oldCalledNewStrs){
            if(callee.includes(".")){
                let arr = callee.split(".");
                for (let index = 0; index < arr.length; index++) {
                    //a.m().d()  arr=[a,m(),d()]
                    if(arr[index].includes("(") && arr[index].includes(")")) {
                        let pre = "";
                        if(index != 0) {
                            for (let i = 0; i < index; i++) {
                                pre += arr[i];
                                pre += ".";
                            }
                        }
                        let newStr = pre + arr[index];
                        //console.log(newStr)
                        if(this.isMatchedParenthese(newStr)) {
                            newCalledStrs.add(newStr);
                        }
                    }
                }
            }else{
                //require
                newCalledStrs.add(callee);
            }
        }
        return newCalledStrs;
    }

    simplifyCalleeStr(currentIndex:number, calledFuns:Set<string>) {
        let oldStr = (Array.from(calledFuns))[currentIndex];
        let newStr = oldStr;
        let index = currentIndex;
        if(index > 0
            && newStr.includes("(")
            && newStr.includes(")")) {
            index = index - 1;
            let substr = (Array.from(calledFuns))[index];
            let i = newStr.indexOf(substr);
            if(i != -1) { //found
                let replacedStr = "custom_pre";
                newStr = ( newStr.substring(0, i)  +  replacedStr  +  newStr.substring(i + substr.length, newStr.length) );
            }
            //if not found, please go on searcher.
        }

        if(this.countAppearNumber(newStr, "(") == 1
            && this.countAppearNumber(newStr, ")") == 1) {
            //console.log("Simplifying old: " + oldStr + "; new: " + newStr);
        }
        else {
            // console.log("Now Simplifying old: " + oldStr + "; new: " + newStr);
        }
        return newStr;
    }



    isMatchedParenthese(str:string) {
        let leftParenthesis = this.countAppearNumber(str, "(");
        let rightParenthesis = this.countAppearNumber(str, ")");

        if(leftParenthesis == rightParenthesis) {
            return true;
        }
        return false;
    }

    countAppearNumber(str:string, subStr:string) {
        let count = 0;
        let start = 0;
        while ((start = str.indexOf(subStr, start)) != -1) {
            start = start + subStr.length;
            count++;
        }
        return count;
    }

    /**
     * find all function ids with same name,
     */
    identifySameMethodName() {
        for (let entity of this.singleCollect.getEntities()) {
            if (entity instanceof FunctionEntity || entity instanceof MethodEntity || entity instanceof PropertyEntity
                || entity instanceof VarEntity || entity instanceof ClassEntity) {
                let name = entity.getSimpleName();
                if(name !== undefined && name.includes(".")){
                    let arr = name.split(".");
                    name = arr[arr.length-1];
                    if (!this.methodsWithSameName.has(name)) {
                        this.methodsWithSameName.set(name, new Set<number>());
                    }
                    // @ts-ignore
                    this.methodsWithSameName.get(name).add(entity.getId());
                }
            }
        }
    }
}
export default CallNewVisitor;