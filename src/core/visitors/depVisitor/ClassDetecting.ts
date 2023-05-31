import DepVisitor from "./DepVisitor";
import NameSearch from "../searcher/NameSearch";
import ProcessEntity from "../entityVisitor/ProcessEntity";
import FunctionEntity from "../../entities/FunctionEntity";
import ModuleEntity from "../../entities/ModuleEntity";
import SingleCollect from "../../utils/SingleCollect";
import Configure from "../../utils/Configure";
import MethodEntity from "../../entities/MethodEntity";


class ClassDetecting{
  depVisitor = new DepVisitor();
  nameSearch = NameSearch.getNameSearchInstance();
  processEntity = new ProcessEntity();
  singleCollect = SingleCollect.getSingleCollectInstance();

  detectClass() {
    for (let entity of this.singleCollect.getEntities()) {
      if(entity instanceof FunctionEntity || entity instanceof MethodEntity){
        //1.如果实体为function，获取ThisBinding字段的true或false，true则func为类构造器，修改function的IsClass字段
        this.isThisBinding(entity);
        //2.prototype原型链
        this.isProto(entity);
        //3.new或Object.create实例化，在callVisitor,callnewVisitor中处理
        //4.instanceOf 操作符
        this.isInstanceOf(entity);
        //5.superType.call(this, arg1...)  ||  superType.apply(this, arg1...)
        //在实体遍历那部分已直接处理
        this.isCall_Apply(entity);
        //6.大驼峰式命名
        //entityVisitor部分获取到语法树名字时直接处理
      //  对于只识别到了大写命名而没有其他特征时，修改该函数为普通函数
        this.checkFormal(entity)
      }
    }
    // console.log(this.singleCollect.getEntities())
  }

  checkFormal(entity:any) {
    if(entity instanceof FunctionEntity || entity instanceof MethodEntity) {
      if(entity.getClassType().length == 1) {
        if(entity.getClassType()[0] == "UpperNaming") {
          //清空，修改为普通函数
          entity.getClassType().length = 0;
        }
      }
    }
  }

  isThisBinding(entity:any) {
    if(entity instanceof FunctionEntity || (entity instanceof MethodEntity && !(entity.getSimpleName().includes(".prototype")))) {
      if(entity.getThisBinding()) {
        if(!(entity.getClassType().includes("ThisBinding"))) {
          entity.setClassType("ThisBinding");
        }
      }
    }
  }

  isProto(entity:any) {
    let protoNames = new Set<string>();
    if(entity instanceof FunctionEntity || entity instanceof ModuleEntity || entity instanceof MethodEntity) {
      protoNames = entity.getProtoDefined();
    }

    if(protoNames == null) {
      return;
    }

    let simplifyNames = this.simpifyNames(protoNames,"isProto");

    //找每一个名字的定义，找到后修改函数IsClass属性
    for(let protoName of simplifyNames) {
      if(Configure.isBuiltInFunction(protoName.split("___")[0])){
        this.processEntity.processPredefinedObject(protoName,entity.getId());
      }else{
        //在这一步找到的protoId不对
        let protoId = this.searchRegularCase(protoName, entity.getId(), "isProto");
        // console.log(protoId)
        if(protoId !== -1 && protoId !== undefined){
          let protoObj = [...this.singleCollect.getEntities()][protoId];
          if(protoObj instanceof FunctionEntity) {
            if(!(protoObj.getClassType().includes("PrototypeDefined"))) {
              protoObj.setClassType("PrototypeDefined");
            }
          }
        }
      }
    }
  }

  isCall_Apply(entity:any) {
    let callNames = new Set<string>();
    if(entity instanceof FunctionEntity || entity instanceof MethodEntity) {
      callNames = entity.getCallApply();
    }
    if(callNames == null) {
      return;
    }

    let simplifyNames = this.simpifyNames(callNames, "call_apply");
    for(let call_applyName of simplifyNames) {
      if(Configure.isBuiltInFunction(call_applyName)){
        this.processEntity.processPredefinedObject(call_applyName,entity.getId());
      }else{
        let call_applyId = this.searchRegularCase(call_applyName, entity.getId(), "isCall_Apply");
        if(call_applyId !== -1 && call_applyId !== undefined){
          let callObj = [...this.singleCollect.getEntities()][call_applyId];
          if(callObj instanceof FunctionEntity) {
            if(!(callObj.getClassType().includes("Call_ApplyExtend"))) {
              callObj.setClassType("Call_ApplyExtend");
            }
          }
        }
      }
    }
  }

  searchRegularCase(protoName:string, modOrFunId:number, flag:string) {
    //对nameMap遍历，保存以纯函数名结尾的id到集合中，并遍历到完整名时退出，然后对集合中的id遍历，看那个是函数，离完整名最近的id函数为最后返回id
    //为每个protoname定义一个map，protoname对应的可能的id
    let tempProto = new Map();
    let scopeId = -1;
    let nameMap = this.nameSearch.getNameMapOfScope(modOrFunId);
    let pureProto = protoName.split("___")[0];
    if(nameMap !== null) {
    //  判断是否已找到完整的名字，如果没找到，则继续找
      let tempIds = new Set();
      // @ts-ignore
      for(let item of nameMap) {
        if(item[0].endsWith(pureProto) && item[0] !== protoName) {
          tempProto.set(protoName.split("___")[1], tempIds.add(item[1]))
        } else {
          break;
        }
      }
    }
    //对生成的map遍历id,找到id对应的实体，从后向前遍历(靠近定义)，如果是函数则直接返回id
    for(let value of tempProto.values()) {
      let tempArr = [...value].reverse();
      for(let i = 0; i < tempArr.length; i++) {
        for(let entity of this.singleCollect.getEntities()) {
          if(entity.getId() == tempArr[i]) {
            // console.log(value[i])
            if(entity instanceof FunctionEntity) {
              scopeId = tempArr[i];
              break;
            }
          }
        }
      }
    }
    return scopeId;
    // if(nameMap !== null){
    //   // @ts-ignore
    //   nameMap.forEach(function (value, key, map){
    //     //不仅要以此名字结束，还需要保证是函数，这里会筛选到属性等以该名字结束
    //     if(flag == "isProto") {
    //       //不含prototype的function名
    //       let pureProto = protoName.split("___")[0];
    //       //获取当前的完整名的id
    //
    //       if(key.endsWith(pureProto)){
    //         scopeId = value;
    //       }
    //     }
    //
    //   })
    //   return scopeId;
    // }
  }


  simpifyNames(names:Set<string>,flag:string) {
    let simpifyNames = new Set<string>();
    names.forEach(item => {
      if(flag == "isProto") {
        if(item.indexOf(".") !== -1 && item.indexOf("prototype") !== -1) {
          if(item.endsWith("prototype")) {
            simpifyNames.add(item.split(".prototype")[0]+"___"+item);
          } else {
            simpifyNames.add(item.split(".prototype.")[0]+"___"+item);
          }
        }
      } else if(flag == "isInstance") {
        if(item.indexOf(".") !== -1) {
          // simpifyNames.add(item.split(".")[0]);
          if(/[A-Z]/.test( item[0])) {
            simpifyNames.add(item.split(".")[0]);
          } else {
            simpifyNames.add(item.split(".")[1]);
          }
        } else {
          simpifyNames.add(item);
        }
      } else if(flag == "call_apply") {
        if(item.indexOf(".call") !== -1){
          simpifyNames.add(item.split(".call")[0]);
        } else if(item.indexOf(".apply")){
          simpifyNames.add(item.split(".apply")[0]);
        }
      }
    })
    return simpifyNames;
  }

  isInstanceOf(entity:any) {
    let instanceNames = new Set<string>();
    if(entity instanceof FunctionEntity || entity instanceof ModuleEntity || (entity instanceof MethodEntity && !(entity.getSimpleName().includes(".prototype")))) {
      instanceNames = entity.getInstanceNames();
    }
    if(instanceNames == null) {
      return;
    }

    let simplifyNames = this.simpifyNames(instanceNames,"isInstance");
    for(let instanceName of simplifyNames) {
      if(Configure.isBuiltInFunction(instanceName)){
        this.processEntity.processPredefinedObject(instanceName,entity.getId());
      }else{
        let protoId = this.searchRegularCase(instanceName, entity.getId(), "isInstanceOf");
        if(protoId !== -1 && protoId !== undefined){
          let protoObj = [...this.singleCollect.getEntities()][protoId];
          if(protoObj instanceof FunctionEntity || (protoObj instanceof MethodEntity && protoObj.getMethodFlag() == "spec")) {
            if(!(protoObj.getClassType().includes("IsInstanceOf"))) {
              protoObj.setClassType("IsInstanceOf");
            }
          }
        }
      }
    }
  }
}
export  default ClassDetecting;