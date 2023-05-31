import DepVisitor from "./DepVisitor";
import NameSearch from "../searcher/NameSearch";
import FunctionEntity from "../../entities/FunctionEntity";
import MethodEntity from "../../entities/MethodEntity";
import VarEntity from "../../entities/VarEntity";
import PropertyEntity from "../../entities/PropertyEntity";
import ModuleEntity from "../../entities/ModuleEntity";
import RelationTuple from "../../utils/RelationTuple";
import Configure from "../../utils/Configure";
import ProcessEntity from "../entityVisitor/ProcessEntity";

class CallVisitor extends DepVisitor {
    depVisitor = new DepVisitor();
    nameSearch = NameSearch.getNameSearchInstance();
    //collect functions with same name.
    methodsWithSameName = new Map<string, Set<number>>();
    processEntity = new ProcessEntity();

    CallVisitor() {
        this.nameSearch.buildNameScope();
        //call this for search possible function calls.
        this.identifySameMethodName();
    }


    setDep() {
        this.CallVisitor();
        for (let entity of this.singleCollect.getEntities()) {
            if (entity instanceof FunctionEntity || entity instanceof ModuleEntity
                || entity instanceof MethodEntity) {
                this.setCallDep1(entity.getId());
            }
        }
        // console.log(this.singleCollect.getEntities())
    }

    /**
     * find all function ids with same name,
     */
    identifySameMethodName() {
        for (let entity of this.singleCollect.getEntities()) {
            if (entity instanceof FunctionEntity || entity instanceof MethodEntity || entity instanceof PropertyEntity
                || entity instanceof VarEntity) {
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
         // console.log(this.methodsWithSameName)
    }


    /**
     * process the callee for this function or method
     * @param modOrFunId
     */
    setCallDep(modOrFunId:number) {
        this.modifyCalledFuncs(modOrFunId);
        let calledFuns = this.getCalledFunctions(modOrFunId);
        if(calledFuns == null) {
            return;
        }
        let idList = new Set<number>();
        for(let index = 0; index < calledFuns.size; index ++) {
            let simpleCalleeStr = this.simplifyCalleeStr(index, calledFuns, idList);
            //console.log(simpleCalleeStr)
            //case 1: simple call, A()
            if(!(simpleCalleeStr.includes(".")) && simpleCalleeStr.endsWith("()")) {
                let calleeId = this.searchCalleeRegularCase(simpleCalleeStr, modOrFunId);
                if(calleeId !== -1 && calleeId !== undefined){
                    this.depVisitor.saveRelation(modOrFunId, calleeId, Configure.RELATION_CALL, Configure.RELATION_CALLED_BY);
                    //console.log(modOrFunId+"---"+calleeId+"----"+Configure.RELATION_CALL+"----"+Configure.RELATION_CALLED_BY);
                }
            }

            //case 2: complex call, a.B() ,custom_pre.C()
            if(simpleCalleeStr.includes(".") && simpleCalleeStr.endsWith("()")){
                if(simpleCalleeStr.startsWith("custom_pre")){
                    simpleCalleeStr = simpleCalleeStr.substring(11,simpleCalleeStr.lastIndexOf("("));
                    this.getRelation(simpleCalleeStr,modOrFunId);
                }else{
                    simpleCalleeStr = simpleCalleeStr.split(".")[1];
                    simpleCalleeStr = simpleCalleeStr.substring(0,simpleCalleeStr.lastIndexOf("("));
                    this.getRelation(simpleCalleeStr,modOrFunId);
                }
            }
        }
}


    setCallDep1(modOrFunId:number){
        this.modifyCalledFuncs(modOrFunId);
        let calledFuns = this.getCalledFunctions(modOrFunId);
        if(calledFuns == null) {
            return;
        }

        //A(), custom_pre.B(), ...
        let simplifyCalleeStrs = this.simplifyCalleeStr1(calledFuns);
        for(let calleeStr of simplifyCalleeStrs) {
            //case 1:  A()
            if(!(calleeStr.includes(".")) && this.countAppearNumber(calleeStr, "(") == 1
                && this.countAppearNumber(calleeStr, ")") == 1){
                calleeStr = calleeStr.split("(")[0];
                if(Configure.isBuiltInFunction(calleeStr)){
                    //内置函数
                    let id = this.processEntity.processPredefinedObject(calleeStr,modOrFunId);
                    this.depVisitor.saveRelation(modOrFunId, id, Configure.RELATION_CALL, Configure.RELATION_CALLED_BY);
                    //console.log(modOrFunId+"---"+id+"----"+Configure.RELATION_CALL+"----"+Configure.RELATION_CALLED_BY);
                }else{
                    let calleeId = this.searchCalleeRegularCase(calleeStr, modOrFunId);
                    if(calleeId !== -1 && calleeId !== undefined){
                        this.depVisitor.saveRelation(modOrFunId, calleeId, Configure.RELATION_CALL, Configure.RELATION_CALLED_BY);
                        //console.log(modOrFunId+"---"+calleeId+"----"+Configure.RELATION_CALL+"----"+Configure.RELATION_CALLED_BY);
                    }
                }
            }

            //case 2: complex call,like A.B();
            //2.1  能找到的可能的call
            //2.2  custom_pre开头的，custom_pre.C();后面的str处理为call
            //2.3  预定义函数，如Array,Object等未处理对象
            else if(calleeStr.includes(".") && this.countAppearNumber(calleeStr, "(") == 1
                && this.countAppearNumber(calleeStr, ")") == 1) {
                calleeStr = calleeStr.split("(")[0];
                let calleeId = this.searchCalleeRegularCase(calleeStr, modOrFunId);
                if(calleeId !== -1 && calleeId !== undefined){
                    this.depVisitor.saveRelation(modOrFunId, calleeId, Configure.RELATION_CALL, Configure.RELATION_CALLED_BY);
                    //console.log(modOrFunId+"---"+calleeId+"----"+Configure.RELATION_CALL+"----"+Configure.RELATION_CALLED_BY);
                }
            } else if(calleeStr.includes(".") && calleeStr.startsWith("custom_pre")){
                //所有的复合名都处理为以custom_pre开头的字符串,并且处理为call
                calleeStr = calleeStr.replace("custom_pre.","");
                this.getRelation(calleeStr,modOrFunId);
            } else {
                let calleeId = this.searchCalleeRegularCase(calleeStr, modOrFunId);
                if(calleeId !== undefined) {
                    this.isClass(calleeId);
                }
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
                //这种情况中应该判断Object.create()后缀
                if(item.startsWith("Object.create()_")) {
                    simplifyCalleeStrs.add(item.split("_")[0]);
                    simplifyCalleeStrs.add(item.split("_")[1]);
                } else {
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
        }
        return simplifyCalleeStrs;
    }

    isClass(entityId:number) {
        let entity = [...this.singleCollect.getEntities()][entityId];
        if(entity instanceof FunctionEntity || entity instanceof MethodEntity){
            if(!(entity.getClassType().includes("Instantiated"))) {
                entity.setClassType("Instantiated");
            }
        }
    }

    getRelation(str:string,scopeId:number){
        if(Configure.isBuiltInFunction(str)){
            //builtIn Function
            let id = this.processEntity.processPredefinedObject(str,scopeId);
            this.depVisitor.saveRelation(scopeId, id, Configure.RELATION_CALL, Configure.RELATION_CALLED_BY);
        }else{
            let possibleCallees = this.searchCalleeByName(str);
            if(possibleCallees !== undefined && possibleCallees.size >0){
                for (let possibleCalleeId of possibleCallees) {
                    this.depVisitor.saveRelation(scopeId, possibleCalleeId, Configure.RELATION_POSSIBLECALL, Configure.RELATION_POSSIBLECALLED_BY);
                    //console.log(scopeId+"---"+possibleCalleeId+"----"+Configure.RELATION_POSSIBLECALL+"----"+Configure.RELATION_POSSIBLECALLED_BY);
                }
            }else{
                //unresolvedMethod
                str = "UnresolvedMethod_"+str;
                let id = this.processEntity.processObjectMethod(scopeId,str,"",false,false);
                this.depVisitor.saveRelation(scopeId, id, Configure.RELATION_CALL, Configure.RELATION_CALLED_BY);
                 //console.log(scopeId+"---"+id+"----"+Configure.RELATION_CALL+"----"+Configure.RELATION_CALLED_BY);
            }
        }
    }

    modifyCalledFuncs(modOrFunOrClsId:number){
        let oldCalledStrs = this.getCalledFunctions(modOrFunOrClsId);
        if(oldCalledStrs == null) {
            return;
        }
        let newCalledStrs = this.getNewListBySplit(oldCalledStrs);
        let entity = (Array.from(this.singleCollect.getEntities()))[modOrFunOrClsId];
        if(entity instanceof FunctionEntity || entity instanceof MethodEntity) {
            entity.setCalledFuncOrCls(newCalledStrs);
        }
        else if(entity instanceof ModuleEntity) {
            entity.setCalledFunctions(newCalledStrs);
        }
    }

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
    /**
     * judge it is form of var.callee() or not.  which can be resolve by var known type.
     * in this case, var is a  variable initialized inside the var's visible scope.
     * var.x.y() : if have more than one dot, we cannot resolve it, it is not localinitvar callee.
     * @param simpleCalleeStr
     * @param modOrFunId
     * @return
     */
    // isLocalInitVarCallee(simpleCalleeStr:string,  modOrFunId:number) {
    //     let res = false;
    //     if(simpleCalleeStr.split("\\(")[0].split("\\.").length >=2) {
    //         return false;
    //     }
    //     if(simpleCalleeStr.split("\\(")[0].startsWith("self.")) {
    //         //System.out.println("isLocalInit: "  + simpleCalleeStr  + " " + true);
    //         return true;
    //     }
    //     //System.out.println("isLocalInit: " + simpleCalleeStr);
    //     if(!simpleCalleeStr.split("\\(")[0].has(".")) {
    //         //System.out.println("isLocalInit: "  + simpleCalleeStr  + " " + false);
    //         return false;
    //     }
    //     let prefixName = simpleCalleeStr.split("\\.")[0];
    //     let nameId = this.nameSearch.getIdByNameInScope(prefixName, modOrFunId);
    //     //System.out.println("search prefix name: " + simpleCalleeStr + " " + Integer.toString(nameId));
    //
    //     if(this.singleCollect.isVariable(nameId) && this.singleCollect.isVarTypeResolved(nameId)) {
    //         res = true;
    //     }
    //     //System.out.println("isLocalInit: "  + simpleCalleeStr  + " " + res);
    //     return res;
    // }


    /**
     * if super(),call parent.init()
     *      * if super().method1(),  and if parent are more than one,
     *      * we don't know which parent the super will refer to, until we see method1().
     *      * beacuse not every parent has method1() method member.
     * @param simpleCalleeStr
     * @return
     */
    isSuperCallee(simpleCalleeStr:string) {
        let destStr = simpleCalleeStr.split("\\(")[0];
        if(destStr == "super") {
            return true;
        }
        return false;
    }


    /**
     * searcher callee which are not "super", not builtin functions.
     * @param simpleCalleeStr
     * @param modOrFunId
     * @return
     */
    searchCalleeRegularCase(simpleCalleeStr:string, modOrFunId:number) {
        // let destStr = simpleCalleeStr.split("(")[0];
        // let scopeId = modOrFunId;
        // //console.log(destStr+"////////"+scopeId)
        //
        // let nameMap = this.nameSearch.getNameMapOfScope(scopeId);
        // if(nameMap !== null){
        //     // @ts-ignore
        //     nameMap.forEach(function (value, key, map){
        //         if(key == destStr){
        //             scopeId = value;
        //         }
        //     })
        //     //scopeId = this.nameSearch.getIdByNameInScope(destStr,scopeId);
        //     return scopeId;
        // }

        let scopeId = -1;
        let nameMap = this.nameSearch.getNameMapOfScope(modOrFunId);
        // console.log(nameMap)
        if(nameMap !== null){
            // @ts-ignore
            nameMap.forEach(function (value, key, map){
                if(key == simpleCalleeStr){
                    scopeId = value;
                }
            })
            return scopeId;
        }
    }

    /**
     * simplify calleeStr as having only one "()".
     * simplify x().y() as a.y().
     * simplify x(y()) as x(a).
     */

    simplifyCalleeStr(currentIndex:number, calledFuns:Set<string>, idList:Set<number>) {
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
            //console.log(newStr)
            //if not found, please go on searcher.
        } else {
            //以点分割，把含有括号的前面那部分替换
            newStr.split(".").forEach(item => {
                if(item.endsWith("()")){
                    let substr = item.split("(")[0]
                    let index = newStr.indexOf(substr);
                    if(index !== -1) {
                        newStr = "custom_pre" + "." + item;
                    }
                }
            })
        }

        if(this.countAppearNumber(newStr, "(") == 1
            && this.countAppearNumber(newStr, ")") == 1) {
            //console.log("Simplifying old: " + oldStr + "; new: " + newStr);
        }
        else {
            //console.log("Now Simplifying old: " + oldStr + "; new: " + newStr);
        }
        return newStr;
    }




    /**
     * get function call list from module or function uerr
     * @param modOrFunId
     * @return
     */
    getCalledFunctions(modOrFunOrClsId:number) {
        let calledStrs = null;
        let entity = (Array.from(this.singleCollect.getEntities()))[modOrFunOrClsId];
        if(entity instanceof FunctionEntity || entity instanceof MethodEntity) {
            calledStrs = entity.calledFunc;
        } else if(entity instanceof ModuleEntity) {
            calledStrs = entity.calledFuncOrCls;
        }
        return calledStrs;
    }


    getNewListBySplit(oldCalledStrs:Set<string>){
        let newCalledStrs = new Set<string>();
        for(let callee of oldCalledStrs){
            //console.log(callee)
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
                        if(this.isMatchedParenthese(newStr)) {
                            newCalledStrs.add(newStr);
                            //console.log("newStr:" + newStr);
                        }
                    }
                }
            }else{
                //require
                newCalledStrs.add(callee);
                //console.log("newStr:" + callee)
            }
        }
        return newCalledStrs;
    }


    /**
     * judge the left parentheses is equal to right parenthesis or not
     * @param str
     * @return
     */
    isMatchedParenthese(str:string) {
        let leftParenthesis = this.countAppearNumber(str, "(");
        let rightParenthesis = this.countAppearNumber(str, ")");

        if(leftParenthesis == rightParenthesis) {
            return true;
        }
        return false;
    }

    /**
     * count the number of substr appearing in str.
     * @param str
     * @param subStr
     * @return
     */
    countAppearNumber(str:string, subStr:string) {
        let count = 0;
        let start = 0;
        while ((start = str.indexOf(subStr, start)) != -1) {
            start = start + subStr.length;
            count++;
        }
        return count;
    }


}
export default CallVisitor;