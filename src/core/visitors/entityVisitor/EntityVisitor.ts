import SingleCollect from "../../utils/SingleCollect";
import PathUtil from "../../utils/PathUtil";
import ProcessEntity from "./ProcessEntity";
import ContextHelper from "./ContextHelper";
import ModuleEntity from "../../entities/ModuleEntity";
import ImportStmt from "../../entities/ImportStmt";
import ClassEntity from "../../entities/ClassEntity";
import FunctionEntity from "../../entities/FunctionEntity";
import * as fs from "fs";
import VarEntity from "../../entities/VarEntity";
import MethodEntity from "../../entities/MethodEntity";
import PropertyEntity from "../../entities/PropertyEntity";
let parser = require("@babel/parser")
const traverse = require("@babel/traverse").default;
class EntityVisitor {
  private fileFullPath;
  private ast;
  private content;
  private code2LocMap = new Map<string,string>();
  // private locMap = new Array<Map<string,string>>();
  // private code2LocMap = new Map<number,Array<Map<string,string>>>();
  private tempMap = new Map();
  private tempModSet = new Set();
  private tempFuncSet = new Set();
  private tempSet = new Set();
  private packageId = -1;
  private moduleId = -1;
  private classId = -1;
  private functionId = -1;

  constructor(fileFullPath: string,ast:any,content:string) {
    this.fileFullPath = fileFullPath;
    this.ast = ast;
    this.content = content;
  }

  processEn = new ProcessEntity();
  singleCollect = SingleCollect.getSingleCollectInstance();
  contextHelper = new ContextHelper();


  visitAll(){
    this.visitPackage();
    this.visitVariableDeclaration();
    this.visitFunction();
    this.visitClass();
    this.visitForStatement();
    this.visitIfStatement();
    this.visitForInStatement();
    this.visitForOfStatement();
    this.visitWhileStatement();
    this.visitDoWhileStatement();
    this.visitSwitchStatement();
    this.visitTryStatement();
    this.visitThrowStatement();
    this.visitExpressionStatement();
    this.visitImportStatement();
    this.visitExportNamedDeclaration();
    this.visitExportDefaultDeclaration();
    //this.visitFunctionExpression();
    // this.visitClassProperty();
    //this.visitClassMethod();
    //this.visitObjectMethod();
    //this.visitObjectProperty();
    // this.visitArrowFunction();
    // this.visitCallExpression();
    // this.visitAssignmentExpression();
    // this.visitReturnStatement();
    this.visitCodeAndLoc(this.code2LocMap,this.singleCollect.getEntities());
    // console.log(this.code2LocMap)
    //  console.log(this.singleCollect.getEntities())
    // for (let i of this.singleCollect.getEntities()) {
    //   if(i.category == "Module") {
    //     console.log(i)
    //   }
    // }
  }


  /**
   * visit the directory
   */
  visitPackage() {
    let current_pkg_full_name;
    if (this.fileFullPath.endsWith(".js")) {
      let dirPath = PathUtil.deleteLastStrByPathDelimiter(this.fileFullPath);
      if (this.singleCollect.getCreatedPackage().has(PathUtil.packagePath(dirPath))) {
        this.packageId = this.singleCollect.getPackageId(PathUtil.packagePath(dirPath));
      } else {
        this.packageId = this.processEn.processUnCreatedPkg(PathUtil.packagePath(dirPath), dirPath);
        this.singleCollect.addCreatedPackage(this.packageId, PathUtil.packagePath(dirPath));
      }
      //check parent package and supplement the parent
      current_pkg_full_name = PathUtil.packagePath(dirPath);
      if (current_pkg_full_name.includes(".")) {
        this.processEn.processParentPackage(current_pkg_full_name, dirPath, this.packageId);
      }
    }
  }

  /**
   * process the class and save it into classEntity
   */
  visitClass() {
    let that = this;
    let baseStr = "";
    traverse(that.ast, {
      ClassDeclaration(path: any) {
        let loc = that.visitLoc(path.node,that.moduleId);
        let codeSnippet = path.toString();
        if(path.node.superClass !== null){
          baseStr = that.visitSuperClassName(path.node.superClass,that.moduleId);
        }
        if(that.contextHelper.isATopLevel(path) && that.moduleId != -1){
          let className;
          if(path.node.id !== null){
            className = path.node.id.name;
          }
          let kind = "ClassDeclaration";
          that.classId = that.processEn.processClass(that.moduleId, className,codeSnippet,loc,baseStr,kind);
          that.processEn.processExport(path,that.classId,className,that.moduleId);
          that.visitBody(path.node.body.body,that.classId);
        }else{
          that.saveLoc2Map(that.moduleId,loc,codeSnippet);
        }
      }
    })
  }

  visitFunction() {
    let that = this;
    traverse(that.ast, {
      FunctionDeclaration(path: any) {
        let funcName = "";
        let codeSnippet = path.toString();
        let loc = that.visitLoc(path.node,that.moduleId);
        if (that.contextHelper.isATopLevel(path) && that.moduleId != -1) {
          let generator = path.node.generator;
          let async = path.node.async;
          if(path.node.id){
            funcName = path.node.id.name;
          }else{
            return that.visitUnNamedFunction(path.node,"",that.moduleId,codeSnippet,generator,async,false);
          }
          that.functionId = that.processEn.processFunction(that.moduleId, funcName, codeSnippet, loc, generator,async);
          that.processEn.processExport(path,that.functionId,funcName,that.moduleId);
          that.visitParams(path.node, that.functionId);
          that.visitBody(path.node.body.body, that.functionId);
        }else{
          that.saveLoc2Map(that.moduleId,loc,codeSnippet);
        }
      }
    })
  }

  visitVariableDeclaration(){
    let that = this;
    if(that.packageId !== -1){
      that.moduleId = that.processEn.processModule(this.fileFullPath,this.packageId);
    }
    traverse(that.ast, {
      VariableDeclarator(path: any) {
        let codeSnippet = path.toString();
        let loc = that.visitLoc(path.node,that.moduleId);
        if(that.contextHelper.isATopLevel(path.parentPath) && that.moduleId != -1){
          let kind = "GlobalVar";
          let isDefineExported = that.contextHelper.isDefineExport(path.parentPath)
          // @ts-ignore
          that.visitLeft(path,path.node,that.moduleId,kind,isDefineExported);
        }else{
          that.saveLoc2Map(that.moduleId,loc,codeSnippet);
        }
      }
    })
  }

  visitTryStatement(){
    let that = this;
    traverse(that.ast, {
      TryStatement(path: any) {
        let codeSnippet = path.toString();
        let loc = that.visitLoc(path.node,that.moduleId);
        if(that.contextHelper.isATopLevel(path) && that.moduleId != -1){
          that.visitTryStmt(path.node,that.moduleId);
        } else{
          that.saveLoc2Map(that.moduleId,loc,codeSnippet);
        }
      }
    })
  }

  visitForStatement(){
    let that = this;
    traverse(that.ast, {
      ForStatement(path: any) {
        let codeSnippet = path.toString();
        let loc = that.visitLoc(path.node,that.moduleId);
        // source.slice(node.start, node.end)
        if(that.contextHelper.isATopLevel(path) && that.moduleId != -1){
          that.visitStatement(path.node,that.moduleId,loc);
        }else{
          that.saveLoc2Map(that.moduleId,loc,codeSnippet);
        }
      }
    })
  }

  visitDoWhileStatement(){
    let that = this;
    traverse(that.ast, {
      DoWhileStatement(path: any) {
        let codeSnippet = path.toString();
        let loc = that.visitLoc(path.node,that.moduleId);
        if(that.contextHelper.isATopLevel(path) && that.moduleId != -1){
          that.visitType(path.node.test,that.moduleId);
          that.visitType(path.node.body,that.moduleId);
        }else{
          that.saveLoc2Map(that.moduleId,loc,codeSnippet);
        }
      }
    })
  }

  visitIfStatement(){
    let that = this;
    traverse(that.ast, {
      IfStatement(path: any) {
        let codeSnippet = path.toString();
        let loc = that.visitLoc(path.node,that.moduleId);
        if(that.contextHelper.isATopLevel(path) && that.moduleId != -1){
          that.visitIfOrConStmt(path.node,that.moduleId);
        }else{
          that.saveLoc2Map(that.moduleId,loc,codeSnippet);
        }
      }
    })
  }

  visitForInStatement(){
    let that = this;
    traverse(that.ast, {
      ForInStatement(path: any) {
        let codeSnippet = path.toString();
        let loc = that.visitLoc(path.node,that.moduleId);
        if(that.contextHelper.isATopLevel(path) && that.moduleId != -1){
          that.visitForInOrOfStmt(path.node,that.moduleId);
        }else{
          that.saveLoc2Map(that.moduleId,loc,codeSnippet);
        }
      }
    })
  }

  visitForOfStatement(){
    let that = this;
    traverse(that.ast, {
      ForOfStatement(path: any) {
        let codeSnippet = path.toString();
        let loc = that.visitLoc(path.node,that.moduleId);
        if(that.contextHelper.isATopLevel(path) && that.moduleId != -1){
          that.visitForInOrOfStmt(path.node,that.moduleId);
        }else{
          that.saveLoc2Map(that.moduleId,loc,codeSnippet);
        }
      }
    })
  }

  visitSwitchStatement(){
    let that = this;
    traverse(that.ast, {
      SwitchStatement(path: any) {
        let codeSnippet = path.toString();
        let loc = that.visitLoc(path.node,that.moduleId);
        if(that.contextHelper.isATopLevel(path) && that.moduleId != -1){
          that.visitType(path.node.discriminant,that.moduleId);
          that.visitBody(path.node.cases,that.moduleId);
        }else{
          that.saveLoc2Map(that.moduleId,loc,codeSnippet);
        }
      }
    })
  }

  visitThrowStatement(){
    let that = this;
    traverse(that.ast, {
      ThrowStatement(path: any) {
        let codeSnippet = path.toString();
        let loc = that.visitLoc(path.node,that.moduleId);
        if(that.contextHelper.isATopLevel(path) && that.moduleId != -1){
          that.visitType(path.node.argument,that.moduleId);
        }else{
          that.saveLoc2Map(that.moduleId,loc,codeSnippet);
        }
      }
    })
  }

  visitWhileStatement(){
    let that = this;
    traverse(that.ast, {
      WhileStatement(path: any) {
        let codeSnippet = path.toString();
        let loc = that.visitLoc(path.node,that.moduleId);
        if(that.contextHelper.isATopLevel(path) && that.moduleId != -1){
          that.visitType(path.node.test,that.moduleId);
          that.visitType(path.node.body,that.moduleId);
        }else{
          that.saveLoc2Map(that.moduleId,loc,codeSnippet);
        }
      }
    })
  }

  visitExpressionStatement(){
    let that = this;
    traverse(that.ast, {
      ExpressionStatement(path: any){
        let codeSnippet = path.toString();
        let loc = that.visitLoc(path.node,that.moduleId);
        if(that.contextHelper.isATopLevel(path) && that.moduleId != -1){
          that.visitExpressionStmt(path.node.expression,that.moduleId,loc);
        }else{
          that.saveLoc2Map(that.moduleId,loc,codeSnippet);
        }
      }
    })
  }


  saveLoc2Map(parentId:number, loc:string, codeSnippet:string) {
    // if(!(this.code2LocMap.has(loc))){
    //   this.code2LocMap.set(loc,codeSnippet);
    // }
    if(!(this.code2LocMap.has(parentId + "_id_" + loc))){
      this.code2LocMap.set(parentId + "_id_" + loc,codeSnippet);
    }
  }

  visitCodeAndLoc(codeAndLocMap:Map<string,string>,allEntity:Set<object>){
    this.processEn.processCode(codeAndLocMap,allEntity);
  }

  visitLoc(path:any,parentId:number){
    let loc = path.loc.start.line + "," + path.loc.start.column+ "," +path.loc.end.line+ "," +path.loc.end.column;
    //获取到所有path的codeSnippet
    let codeSnippet = this.content.slice(path.start,path.end);
    // this.code2LocMap.set(loc,codeSnippet);
    this.code2LocMap.set(parentId + "_id_" + loc,codeSnippet);

    // 太长的codesnippet筛掉 无法判断类型
    // let parentObj = Array.from(this.singleCollect.getEntities())[parentId];
    // if(codeSnippet.length > 200) {
    //   codeSnippet = codeSnippet.substr(0, 199)
    // }
    // if(codeSnippet.length <= 200 &&  !(/^[0-9]*$/.test(codeSnippet))) {
    //   //如果为module,code应该把它内部的函数的code也加进去
    //   while(parentObj instanceof ModuleEntity || parentObj instanceof FunctionEntity || parentObj instanceof MethodEntity) {
    //     parentObj.addCode(codeSnippet);
    //     parentId = parentObj.getParentId();
    //     parentObj = Array.from(this.singleCollect.getEntities())[parentId];
    //   }
    // }
    return loc;
  }

  visitType(path:any,parentId:number){
    if(path !== null && path.type){
      let loc = this.visitLoc(path,parentId);
      if(path.type.endsWith("Expression")){
        this.visitExpressionStmt(path,parentId,loc);
      } else if(path.type.endsWith('Statement')) {
        this.visitStatement(path,parentId,loc);
      } else if(path.type.endsWith("Declaration")){
        this.visitDeclaration(path,parentId,loc);
      } else if(path.type.endsWith("Method")){
        // let loc = this.visitLoc(path,parentId);
        this.visitMethod(path,parentId,loc);
      } else {
        this.visitOtherFormStmt(path,parentId);
      }
    }
  }

  visitLogicalExp(path:any,parentId:number){
    while(path.left.type == "LogicalExpression"){
      this.visitType(path.right,parentId);
      path = path.left;
    }
    if(path.left.type !== "LogicalExpression"){
      this.visitType(path.left,parentId);
      this.visitType(path.right,parentId);
    }
  }

  visitUpdateExp(path:any,parentId:number){
    if(path !== null){
      let str = '';
      let isModify = this.contextHelper.isModify(path.operator);
      let isLeftAssign = false;
      if(path.argument.type == "Identifier"){
        str = path.argument.name;
      } else if(path.argument.type == "MemberExpression"){
        str = this.visitCoreMemberName(path.argument,parentId);
      }
      this.processEn.processLocOrGloName(parentId,str,isLeftAssign,isModify);
      return str;
    }
  }

  visitUnNamedFunction(body:any,funcName:string,parentId:number,codeSnippet:string,generator:boolean,async:boolean, isArrow:boolean){
    let parentObj:any;
    let isLeftAssign = false;
    let isModify = false;
    let isStatic = false;
    let originParentId = parentId;
    let loc = this.visitLoc(body,parentId);
    parentObj = (Array.from(this.singleCollect.getEntities()))[parentId];
    while(parentObj !== undefined && !(parentObj instanceof ModuleEntity)){
      parentId = parentObj.getParentId();
      parentObj = (Array.from(this.singleCollect.getEntities()))[parentId];
    }
    if(parentObj !== undefined){
      let index = parentObj.getUnNamed_FuncId();
      if(funcName == ""){
        funcName = "unnamed_function_" + (++index);
      }
      // let funcName = "unnamed_function_" + (++index);
      this.functionId = this.processEn.processFunction(originParentId,funcName,codeSnippet,loc,generator,async);
      let originParentObj = (Array.from(this.singleCollect.getEntities()))[originParentId];
      if(originParentObj instanceof FunctionEntity || originParentObj instanceof MethodEntity){
        originParentObj.addUnNamed_FuncId(this.functionId);
      }else if(originParentObj instanceof ModuleEntity){
        originParentObj.addPtrUnnamed_funcIds(this.functionId);
      }
      this.processEn.processExport(body,this.functionId,funcName,this.moduleId);
      parentObj.addUnNamed_FuncId(this.functionId);
      //visit params
      this.visitParams(body,this.functionId);
      //visit body
      if (body.body.type == "MemberExpression") {
        let propName = this.processEn.formalizeStr(this.visitCoreMemberName(body.body,parentId));
        if(propName.includes("()") || propName.startsWith("new ")){
          this.processEn.processCallee(parentId,propName);
        }else{
          this.processEn.processProperty(this.functionId,propName,loc,isLeftAssign,isModify,isStatic);
        }
      } else if (body.body.type == "BinaryExpression") {
        this.visitBinary(body.body,parentId);
      } else {
        this.visitType(body.body,this.functionId);
      }
    }
  }

  visitLeft(path:any,pathNode:any,parentId:number,kind:string,isDefineExported:boolean){
    let varName;
    let varType;
    let left;
    let right;
    let isLeftAssign = true;
    let isModify = false;
    let codeSnippet = path.toString();
    let loc = this.visitLoc(pathNode,parentId);
    if(pathNode.id){
      left = pathNode.id;
      right = pathNode.init;
    } else if(pathNode.left){
      left = pathNode.left;
      right = pathNode.right;
      isModify = this.contextHelper.isModify(pathNode.operator);
    }
    if(right !== null){
      varType = right.type;
    }else{
      //let a;
      isLeftAssign = false;
      varType = null;
    }
    if(left.type == "Identifier"){
      //var a = **
      varName = left.name;
      if(varName !== "__importDefault" && varName !== "__decorate"){
        return this.visitVarRight(right,varName,varType,codeSnippet,loc,parentId,kind,isDefineExported,isLeftAssign,isModify);
      }
    }else if(left.type == "ObjectPattern"){
      //let {a,b} = **
      if (left.properties.length > 0) {
        for (let property of left.properties) {
          varName = property.key.name;
          let varId = this.visitVarRight(right,varName,varType,codeSnippet,loc,parentId,kind,isDefineExported,isLeftAssign,isModify);
          // @ts-ignore
          this.visitObjectPattern(property,varId,loc);
        }
      }
    }else if(left.type == "ArrayPattern"){
      //let [a,b]=**
      for(let elem of left.elements){
        if(elem !== null){
          if(elem.type == "Identifier"){
            varName = elem.name;
          }else if(elem.type == "RestElement"){
            if(elem.argument.type == "Identifier"){
              varName = elem.argument.name;
            } else if(elem.argument.type == "ArrayPattern"){
              return this.visitBody(elem.argument.elements,parentId);
            } else if(elem.argument.type == "ObjectPattern"){
              return this.visitBody(elem.argument.properties,parentId);
            }
          }
          this.visitVarRight(right,varName,varType,codeSnippet,loc,parentId,kind,isDefineExported,isLeftAssign,isModify);
        }
      }
    }
  }

  visitVarRight(path:any,varName:string,varType:string,codeSnippet:string,loc:string,parentId:number,kind:string,isDefineExported:boolean,isLeftAssign:boolean,isModify:boolean){
    let varId;
    // console.log(varName)
    if(varType == "FunctionExpression"){
      let generator = path.generator;
      let async = path.async;
      if(path.id !== null){
        varId = this.processEn.processVar(parentId,varName,varType,codeSnippet,loc,kind,isDefineExported,isLeftAssign,isModify);
        this.functionId = this.processEn.processFunction(varId,path.id.name,codeSnippet,loc,generator,async);
      }else{
        this.functionId = this.processEn.processFunction(parentId,varName,codeSnippet,loc,generator,async);
      }
      this.visitParams(path,this.functionId);
      this.visitBody(path.body.body,this.functionId);
    } else if(varType == "ClassExpression"){
      let isVar = true;
      this.classId = this.visitClassExp(parentId,path,codeSnippet,loc,varName,kind,isDefineExported,isLeftAssign,isModify,isVar);
    } else {
      varId = this.processEn.processVar(parentId,varName,varType,codeSnippet,loc,kind,isDefineExported,isLeftAssign,isModify);
      if(varType == "CallExpression" || varType == "NewExpression"){
        let calleeStr = this.visitCallExp(path,parentId);
        if(varType == "NewExpression" || calleeStr.includes("new ")){
          if(!calleeStr.includes("new ")){
            calleeStr = 'new ' + calleeStr
          }
          //在这里可直接把new的类型加到var的inferType中
          // calleeStr = this.processEn.formalizeCallee(calleeStr);
          // 把calleestr加到对应变量的infer_type中
          this.processEn.save_infer_type(varId, calleeStr);
        }
        calleeStr = this.processEn.formalizeStr(calleeStr);
        this.processEn.processCallee(parentId,calleeStr);
      } else if (varType == "MemberExpression") {
        let calleeStr = this.processEn.formalizeStr(this.visitCoreMemberName(path,parentId));
        if(calleeStr.includes("()") || calleeStr.startsWith("new ")){
          this.processEn.processCallee(parentId,calleeStr);
        }else{
          this.processEn.processProperty(varId,calleeStr,loc,false,false,false);
        }
      } else if(varType == "ArrayExpression"){
        this.visitBody(path.elements,varId);
      } else if(varType == "UpdateExpression"){
        this.visitUpdateExp(path,varId);
      } else if(varType == "ObjectExpression"){
        this.visitBody(path.properties,varId);
      } else if(varType == "BinaryExpression"){
        this.visitBinary(path,varId);
      } else {
        this.visitType(path,parentId);
      }
    }
    return varId;
  }

  visitObjectPattern(property:any,parentId:number,loc:string){
    let propName = "";
    let isLeftAssign = false;
    let isModify = false;
    let isStatic = false;
    if(property.value.type == "ObjectPattern"){
      return this.visitBody(property.value.properties,parentId);
    }else if(property.value.type == "Identifier"){
      if(property.value.name !== property.key.name){
        propName = property.value.name;
      }else{
        return;
      }
    } else if(property.value.type == "MemberExpression"){
      propName = this.processEn.formalizeStr(this.visitCoreMemberName(property.value,parentId));
    } else if(property.value.type == "AssignmentPattern"){
      return this.visitBinary(property.value,parentId);
    }
    this.processEn.processProperty(parentId,propName,loc,isLeftAssign,isModify,isStatic);
  }

  visitClassExp(parentId:number,body:any,codeSnippet:string,loc:string,propName:string,kind:string,isDefineExported:boolean,isLeftAssign:boolean,isModify:boolean,isVar:boolean){
    let baseStr = "";
    let className;
    let type = "ClassExpression"
    if(body.superClass !== null){
      baseStr = this.visitSuperClassName(body,parentId);
    }
    if(body.id !== null){
      className = body.id.name;
      this.classId = this.processEn.processClass(parentId,className,codeSnippet,loc,baseStr,kind);
      if(isVar){
        this.processEn.processVar(parentId,propName,type,codeSnippet,loc,kind,isDefineExported,isLeftAssign,isModify);
      }else{
        this.processEn.processProperty(parentId,propName,loc,isLeftAssign,isModify,false);
      }
    }else{
      this.classId = this.processEn.processClass(parentId,propName,codeSnippet,loc,baseStr,kind);
    }
    if(isDefineExported == true){
      this.processEn.processDefineExport(parentId,this.classId,propName,!isDefineExported,isDefineExported);
    }
    this.visitBody(body.body.body,this.classId);
    return this.classId;
  }

  visitBody(bodyPath:any,parentId:number){
    if(bodyPath && bodyPath.length > 0){
      //如果父类是函数，需要在此判断body[0]的特点
      let parentObj = [...this.singleCollect.getEntities()][parentId];
      if(parentObj instanceof FunctionEntity) {
        this.isCall_Apply_Extend(bodyPath[0],parentId);
      }
      for(let body of bodyPath){
        this.visitType(body,parentId);
      }
    }
  }

  isCall_Apply_Extend(body:any,parentId:number) {
    let calleStr = "";
    if(body !== null && body !== undefined && body.type !== undefined && body.type == "ExpressionStatement") {
      if(body.expression !== undefined && body.expression.type && body.expression.type == "CallExpression") {
        if(body.expression.callee !== undefined && body.expression.callee.type && body.expression.callee.type == "MemberExpression") {
          calleStr = this.processEn.formalizeStr(this.visitCoreMemberName(body.expression.callee,parentId));
          if(calleStr.endsWith(".call") || calleStr.endsWith(".apply")){
            if(body.expression.arguments[0] !== undefined && body.expression.arguments[0].type == "ThisExpression") {
              //A.call(this, arg1,..),  A.apply(this, arg1,..);
              //call或apply前的保存到对应的function或method实体
              this.processEn.processCall_ApplyFunc(calleStr, parentId);
              // let entity = [...this.singleCollect.getEntities()][parentId];
              // if(entity instanceof FunctionEntity || entity instanceof MethodEntity) {
              //   if(!(entity.getClassType().includes("Call_ApplyExtend"))) {
              //     entity.setClassType("Call_ApplyExtend")
              //     // console.log(entity)
              //   }
              // }
            }
          }
        }
      }
    }
  }

  visitStatement(body:any,parentId:number,loc:string){
    if(body.type == "TryStatement"){
      this.visitTryStmt(body,parentId);
    } else if(body.type == "ThrowStatement"){
      this.visitType(body.argument,parentId);
    } else if(body.type == "ReturnStatement"){
      //保存return 语句以及value
      //在这里先把func和method的loc存起来，否则在最后会找不到
      this.processEn.saveReturnLoc4Func(loc, parentId)
      this.visitType(body.argument,parentId);
    } else if(body.type == "IfStatement"){
      this.visitIfOrConStmt(body,parentId);
    } else if(body.type == "ForStatement"){
      this.visitType(body.init, parentId);
      this.visitType(body.test, parentId);
      this.visitType(body.update,parentId);
      this.visitType(body.body,parentId);
    }else if(body.type == "ForOfStatement" || body.type == "ForInStatement"){
      this.visitForInOrOfStmt(body,parentId);
    } else if(body.type == "WhileStatement" || body.type == "DoWhileStatement"){
      this.visitType(body.test,parentId);
      this.visitType(body.body,parentId);
    }else if(body.type == "SwitchStatement"){
      this.visitType(body.discriminant,parentId);
      this.visitBody(body.cases,parentId);
    } else if(body.type == "BlockStatement"){
      this.visitBody(body.body,parentId);
    }else if(body.type == "ExpressionStatement") {
      this.visitExpressionStmt(body.expression,parentId,loc);
    }
  }

  visitDeclaration(body:any,parentId:number,loc:string){
    this.processEn.saveInnerLoc4Func(loc, parentId);
    if(body.type == "ClassDeclaration"){
      this.visitNestedClass(body,parentId);
    }else if(body.type == "FunctionDeclaration"){
      //nested function   function A(){function B(){}}
      let generator = body.generator;
      let async = body.async;
      let codeSnippet = "";
      let loc = this.visitLoc (body,parentId);
      this.functionId = this.processEn.processFunction(parentId,body.id.name,codeSnippet,loc,generator,async);
      this.visitParams(body,this.functionId);
      this.visitBody(body.body.body,this.functionId);
    }else if(body.type == "VariableDeclaration"){
      this.visitVar(body,parentId);
    }
  }

  visitOtherFormStmt(body:any,parentId:number){
    if(body.type == "SpreadElement"){
      let varName;
      if(body.argument.type == "Identifier"){
        varName = body.argument.name;
        let isLeftAssign = false;
        let isModify = this.contextHelper.isModify(body.argument);
        this.processEn.processParameter(parentId,varName,isLeftAssign,isModify);
      }else if(body.argument.type == "MemberExpression"){
        varName = this.visitCoreMemberName(body.argument,parentId);
        varName = this.processEn.formalizeStr(varName);
        if(varName.includes("()") || varName.startsWith("new ")){
          this.processEn.processCallee(parentId,varName);
        }else{
          this.processEn.processParameter(parentId,varName,false,false);
        }
      }
    } else if(body.type == "ObjectProperty" || body.type == "ClassProperty"){
      let isStatic = false;
      if(body.static){
        isStatic = body.static;
      }
      this.visitProperty(body,parentId,isStatic);
    }else if(body.type == "Identifier"){
      let isLeftAssign = false;
      let isModify = false;
      this.processEn.processParameter(parentId,body.name,isLeftAssign,isModify);
    }else if(body.type == "SwitchCase"){
      this.visitType(body.test,parentId);
      this.visitBody(body.consequent,parentId);
    }else if(body.type == "TemplateLiteral"){
      this.visitBody(body.expressions,parentId);
    }
  }

  visitExpressionStmt(expression:any,parentId:number,loc:string){
    let generator = expression.generator;
    let async = expression.async;
    //获取了每一个expr的loc
    // let loc = this.visitLoc(expression);
    //把loc与code存到codeMap中
    this.processEn.saveInnerLoc4Func(loc, parentId);
    // console.log(parentId + "///////////////" + loc)
    if(expression.type == "FunctionExpression"){
      this.visitFunctionExp(expression,parentId);
    } else if(expression.type == "ArrowFunctionExpression"){
      let isArrow = true;
      this.visitUnNamedFunction(expression,"",parentId,"",generator,async,isArrow);
    } else if(expression.type == "ClassExpression"){

    } else if(expression.type == "MemberExpression"){
      let calleeStr = this.processEn.formalizeStr(this.visitCoreMemberName(expression,parentId));
      if(calleeStr.includes("()") || calleeStr.startsWith("new ")){
        this.processEn.processCallee(parentId,calleeStr);
      }else{
        this.processEn.processProperty(parentId,calleeStr,loc,false,false,false);
      }
    } else if(expression.type == "CallExpression" || expression.type == "NewExpression"){
      let calleeStr = this.visitCallExp(expression,parentId);
      if (calleeStr == "super()"){
        this.processEn.processVar(parentId,"super","CallExpression","super()","","LocalVar",false,false, false)
      }
      if(expression.type == "NewExpression"){
        if(calleeStr !== "" && !calleeStr.includes("new ")){
          calleeStr = "new " + calleeStr;
        }
        // calleeStr = this.processEn.formalizeCallee(calleeStr);
      }
      // calleeStr = this.processEn.formalizeStr(calleeStr);
      this.processEn.processCallee(parentId,calleeStr);
      this.visitBody(expression.arguments,parentId);
    } else if(expression.type == "BinaryExpression"){
      this.visitBinary(expression,parentId);
    } else if(expression.type == "UnaryExpression"){
      this.visitType(expression.argument,parentId);
    } else if(expression.type == "ConditionalExpression"){
      this.visitIfOrConStmt(expression,parentId);
    } else if(expression.type == "ArrayExpression"){
      this.visitBody(expression.elements,parentId);
    } else if(expression.type == "ObjectExpression"){
      this.visitBody(expression.properties,parentId);
    } else if(expression.type == "SequenceExpression"){
      this.visitBody(expression.expressions,parentId);
    } else if(expression.type == "AssignmentExpression"){
      this.visitExpr(parentId,expression);
    } else if(expression.type == "LogicalExpression"){
      this.visitLogicalExp(expression,parentId);
    } else if(expression.type == "UpdateExpression"){
      this.visitUpdateExp(expression,parentId);
    } else if(expression.type == "YieldExpression"){
      this.visitType(expression.argument,parentId);
    } else if(expression.type == "TaggedTemplateExpression"){
      this.visitType(expression.tag,parentId);
      this.visitType(expression.quasi,parentId);
    } else if(expression.type == "AwaitExpression"){
      this.visitType(expression.argument,parentId);
    }
  }

  visitFunctionExp(exp:any,parentId:number){
    let generator = exp.generator;
    let async = exp.async;
    let loc = this.visitLoc(exp,parentId);
    let codeSnippet = "";
    if (exp.id !== null) {
      let funcName = exp.id.name;
      this.functionId = this.processEn.processFunction(parentId,funcName,codeSnippet,loc,generator,async);
      this.visitParams(exp,this.functionId);
      this.visitBody(exp.body.body,this.functionId);
    }else{
      this.visitUnNamedFunction(exp,"",parentId,codeSnippet,generator,async,false);
    }
  }

  /**
   *   If, ConditionalExp Statement
   */
  visitIfOrConStmt(body:any,parentId:number){
    this.visitType(body.test,parentId);
    this.visitType(body.consequent,parentId);
    this.visitType(body.alternate,parentId);
  }

  /**
   *   forIn,forOf Statement
   */
  visitForInOrOfStmt(body:any,parentId:number){
    this.visitBinary(body,parentId);
    this.visitType(body.body,parentId);
  }

  visitTryStmt(body:any,parentId:number){
    let kind;
    this.visitBody(body.block.body,parentId);
    if((Array.from(this.singleCollect.getEntities()))[parentId] instanceof ModuleEntity){
      kind = "GlobalVar";
    }else{
      kind = "LocalVar"
    }
    if(body.handler !== null){
      if(body.handler.param !== null){
        let codeSnippet = body.handler.param.name;
        let loc = this.visitLoc(body.handler.param,parentId)
        let isLeftAssin = false;
        let isModify = false;
        this.processEn.processVar(parentId,body.handler.param.name,"",codeSnippet,loc,kind,false,isLeftAssin,isModify);
      }
      this.visitBody(body.handler.body.body,parentId);
    }
    if(body.finalizer !== null){
      this.visitBody(body.finalizer.body,parentId);
    }
  }

  /**
   * visit expressionLeft name,like this.a, a.b...
   */
  visitExpr(parentId:number,body:any) {
    let isLeftAssign = true;
    let isModify = false;
    let propName = "";
    let prefixName = "";
    let suffixPropName;
    let codeSnippet = "";
    let originPath = body;
    let loc = this.visitLoc(body,parentId);
    let kind;
    let parentObj = (Array.from(this.singleCollect.getEntities()))[parentId];
    if(parentObj instanceof ModuleEntity){
      kind = "GlobalVar";
    }else{
      kind = "LocalVar"
    }


    if (body.left.type == "MemberExpression") {
      if(body.left.object.type == "ThisExpression"){
        //如果父类为method,并且constructor为true,把this处理为变量
        if(parentObj instanceof MethodEntity) {
          if (parentObj.getConstructor()){
            this.processEn.processVar(parentId,"this" ,"ThisExpression",codeSnippet,loc,kind,false,isLeftAssign,isModify)
          }
        }
        //在这里判断一下，这个this属性的父类是不是function,如果parantObj是function，并且内部body的左侧是this.a,operator是=, 这样可以说明这个function是一个类构造器,isClass为true
        if(body.operator == "=") {
          this.processEn.isThisBinding(parentObj);
        }
        propName = this.processEn.formalizeStr(this.visitCoreMemberName(body.left,parentId));
      } else if(body.left.object.type == "MemberExpression"){
        propName = this.processEn.formalizeStr(this.visitCoreMemberName(body.left,parentId));
      } else if (body.left.object.type == "CallExpression") {
        propName = this.processEn.formalizeStr(this.visitCoreMemberName(body.left,parentId));
        let calleestr = this.visitCallExp(body.left.object,parentId);
        this.processEn.processCallee(parentId,calleestr);
      } else if(body.left.object.type == "Identifier"){
        prefixName = body.left.object.name;
        if(body.left.property.type == "Identifier"){
          suffixPropName = body.left.property.name;
        }else if(body.left.property.type == "MemberExpression"){
          suffixPropName = this.processEn.formalizeStr(this.visitCoreMemberName(body.left.property,parentId));
        }else if(body.left.property.type == "UpdateExpression"){
          suffixPropName = this.visitUpdateExp(body.left.property,parentId);
        } else if(body.left.property.type == "BinaryExpression"){
          this.visitBinary(body.left.property,parentId);
        }
        if(suffixPropName !== undefined){
          propName = prefixName + "." + suffixPropName;
        }else{
          propName = prefixName;
        }
      }
      //在这里判断propName是否包含prototype属性，如果包含，把它的名字直接存起来
      // console.log(propName)
      if(propName.search("prototype") !== -1) {
          this.processEn.processPrototype(propName,parentObj);
      }
      this.visitExprBody(originPath.right,propName,codeSnippet,loc,parentId,isLeftAssign,isModify);
    } else {
      this.visitLeft(body,body,parentId,kind,false);
    }
  }

  visitExprBody(body:any,propName:string,codeSnippet:string,loc:string,parentId:number,isLeftAssign:boolean,isModify:boolean){
    let isStatic = false;
    if(propName !== ""){
      if(body.type == "FunctionExpression"){
        let methodId;
        let generator = body.generator;
        let async = body.async;
        let parentObj = (Array.from(this.singleCollect.getEntities()))[parentId];
        if(body.id !== null){
          this.processEn.processProperty(parentId,propName,loc,isLeftAssign,isModify,isStatic);
          propName = body.id.name;
        }
        this.functionId = this.processEn.processFunction(parentId,propName,codeSnippet,loc,generator,async);
        this.visitParams(body,this.functionId);
        this.visitBody(body.body.body,this.functionId);
        //这里的左侧是表达式，不是所关注的方法
        // methodId = this.processEn.processObjectMethod(parentId,propName,loc,generator,async);
        // this.visitParams(body,methodId);
        // this.visitBody(body.body.body,methodId);
      } else if(body.type == "ClassExpression"){
        this.processEn.processLocOrGloName(parentId,propName,isLeftAssign,isModify);
        let isDefineExport = false;
        let isVar = false;
        this.visitClassExp(parentId,body,codeSnippet,loc,propName,body.type,isDefineExport,isLeftAssign,isModify,isVar);
      } else {
        let propId = this.processEn.processProperty(parentId,propName,loc,isLeftAssign,isModify,isStatic);
        if(body.type == "ObjectExpression"){
          this.visitBody(body.properties,propId);
        }else if(body.type =="ArrayExpression"){
          this.visitBody(body.elements,propId);
        }else if(body.type == "BinaryExpression"){
          this.visitBinary(body,propId);
        }else if(body.type == "ArrowFunctionExpression"){
          this.visitUnNamedFunction(body,propName,parentId,codeSnippet,body.generator,body.async,true)
        }else if(body.type == "NewExpression"){
          let calleeStr = this.visitCallExp(body,parentId);
          if(calleeStr !== "" && !calleeStr.includes("new ")){
            calleeStr = "new " + calleeStr;
          }
          //暂时不处理最初的调用形式，为了判断是哪种实例化类型
          // calleeStr = this.processEn.formalizeCallee(calleeStr);
          this.processEn.save_infer_type(propId, calleeStr);
        } else {
          this.visitType(body,parentId);
        }
      }
    }
  }

  visitCoreMemberName(body:any,parentId:number){
    let str = "";
    let lastPropName;
    let tempArr = [];
    while(body.object.type == "MemberExpression") {
      //a.b.c.. == **
      if(body.property.name){
        lastPropName = body.property.name;//last propName
      }else{
        lastPropName = body.property.value;
      }
      tempArr.push(lastPropName);
      body = body.object;
    }
    if(body.object.type == "Identifier"){
      //a.b.c.d=**
      if(body.property.type == 'UpdateExpression'){
        tempArr.push(this.visitUpdateExp(body.property,parentId));
      } else {
        if(body.property.name){
          tempArr.push(body.property.name);
        }else if(body.property.value){
          tempArr.push(body.property.value);
        }
      }
      tempArr.push(body.object.name);
    }else if(body.object.type == "ThisExpression" || body.object.type == "RegExpLiteral"){
      //this.a.b.c=**
      tempArr.push(body.property.name);
    }else if(body.object.type == "CallExpression" || body.object.type == "NewExpression"){
      tempArr.push(body.property.name);
      tempArr.push(this.visitCallExp(body.object,parentId));
      for(let i = tempArr.length-1;i>=0;i--){
        str += tempArr[i] + "."
      }
      str = this.processEn.formalizeStr(str);
      if(body.object.type == "NewExpression"){
        str = "new " +  str;
      }
      return str;
    }else{
      tempArr.push(body.property.name);
    }
    for(let i = tempArr.length-1;i>=0;i--){
      str += tempArr[i] + "."
    }
    return str;
  }

  /**
   * visit calleeStr and callNewStr,and visit their arguments
   */
  visitCallExp(body:any,parentId:number){
    let calleeStr = "";
    let codeSnippet = "";
    let loc = this.visitLoc(body,parentId);
    if(body.callee.type == "Super"){
      calleeStr = "super()";
    }else if(body.callee.type == "Identifier"){
      this.visitBody(body.arguments,parentId);
      //A().B.C  || new A().B.C
      calleeStr = body.callee.name + "()";
      if(body.type == "NewExpression"){
        calleeStr = "new " + body.callee.name + "()";
      }
    }else if(body.callee.type == "MemberExpression"){
      //A().B().C
      calleeStr = this.visitCoreMemberName(body.callee,parentId);
      if(calleeStr.startsWith("new ")){
        calleeStr = this.processEn.formalizeCallee(calleeStr);
        calleeStr = "new "+ calleeStr;
        // 未执行完毕，无法返回，直接存入callNew
        this.processEn.processCallee(parentId, calleeStr)
      } else{
        calleeStr = this.processEn.formalizeStr(calleeStr);
        calleeStr = calleeStr + "()";
        if(calleeStr.startsWith("Object.create")) {
          //携带参数,到依赖部分处理这部分参数
          if(body.arguments[0].type == "Identifier") {
            calleeStr = calleeStr + "_" + body.arguments[0].name;
          } else if(body.arguments[0].type == "MemberExpression"){
            calleeStr = calleeStr + "_" + this.processEn.formalizeStr(this.visitCoreMemberName(body.arguments[0],parentId));
          }
        } else {
          this.visitBody(body.arguments,parentId);
        }
      }
    }else if(body.callee.type == "FunctionExpression"){
      //(function(a){})()
      this.visitBody(body.arguments,parentId);
      let generator = body.callee.generator;
      let async = body.callee.async;
      if(body.callee.id !== null){
        let funcName = body.callee.id.name;
        this.functionId = this.processEn.processFunction(parentId,funcName,codeSnippet,loc,generator,async);
        this.visitParams(body.callee,this.functionId);
        this.visitBody(body.callee.body.body,this.functionId);
      }else{
        this.visitUnNamedFunction(body.callee,"",parentId,codeSnippet,generator,async,false);
      }
    }else if(body.callee.type == "ArrowFunctionExpression"){
      this.visitBody(body.arguments, parentId);
      let generator = body.callee.generator;
      let async = body.callee.async;
      this.visitUnNamedFunction(body.callee,"",parentId,codeSnippet,generator,async,true);
    }else if(body.callee.type == "CallExpression"){
      calleeStr = this.visitCallExp(body.callee,parentId);
    }
    return calleeStr;
  }

  visitMethod(body:any,parentId:number,loc:string){
    let methodName = "";
    let codeSnippet = "";
    let methodId:any;
    let isLeftAssign = false;
    let isModify = false;
    let isStatic = false;
    let flag;
    if(body.static){
      flag = body.static;
    }
    let kind = body.kind;
    let cons = false;
    let generator = body.generator;
    let async = body.async;
    if(body.key.name){
      methodName = body.key.name;
    } else if(body.key.value){
      methodName = body.key.value;
    }
    let parentObj = Array.from(this.singleCollect.getEntities())[parentId];
    if(parentObj instanceof ClassEntity){
      if(kind == "constructor"){
        cons = true;
        methodId = this.processEn.processClassMethod(parentId, methodName,codeSnippet,loc,flag,cons);
      }else if(kind == "get" || kind == "set"){
        methodId = this.processEn.processFunction(parentId,kind,codeSnippet,loc,generator,async);
        this.processEn.processProperty(parentId,methodName,loc,isLeftAssign,isModify,isStatic);
      }else{
        methodId = this.processEn.processClassMethod(parentId, methodName,codeSnippet,loc,flag,cons);
      }
    }else {
      if(kind == "get" || kind == "set"){
        methodId = this.processEn.processFunction(parentId,kind,codeSnippet,loc,generator,async);
        this.processEn.processProperty(parentId,methodName,loc,isLeftAssign,isModify,isStatic);
      }else{
        if(methodName !== ""){
          methodId = this.processEn.processObjectMethod(parentId, methodName,loc,generator,async);
        }
      }
    }
    this.visitParams(body,methodId);
    this.visitBody(body.body.body,methodId);
  }


  visitNestedClass(body:any,parentId:number){
    let baseStr = "";
    let kind = "";
    let className;
    if(body.id !== null){
      className = body.id.name;
    }
    let codeSnippet = "";
    let loc = this.visitLoc(body,parentId);
    if(body.superClass){
      baseStr = this.visitSuperClassName(body.superClass,parentId);
    }
    this.classId = this.processEn.processClass(parentId,className,codeSnippet,loc,baseStr,kind);
    this.visitBody(body.body.body,this.classId);
  }

  visitProperty(body:any,parentId:number,isStatic:boolean){
      let propName = body.key.name;
      let isLeftAssign = true;
      let isModify = false;
      let codeSnippet = "";
      let loc = this.visitLoc(body,parentId);
      let valueType;

      if(body.key.type == "Identifier"){
        propName = body.key.name;
      }else if(body.key.type == "StringLiteral"){
        propName = body.key.value;
      }else if(body.key.type == "MemberExpression"){
        propName = this.processEn.formalizeStr(this.visitCoreMemberName(body.key,parentId));
      }

      if(body.value !== null){
        valueType = body.value.type;
      }
      if(valueType == "FunctionExpression"){
        //let a ={ b:function(){} }
        let methodId;
        let generator = body.value.generator;
        let async = body.value.async;
        if(body.value.id !== null){
          let propId = this.processEn.processProperty(parentId,propName,loc,isLeftAssign,isModify,isStatic);
          methodId = this.processEn.processFunction(propId,body.value.id.name,codeSnippet,loc,generator,async);
        } else {
          methodId = this.processEn.processObjectMethod(parentId,propName,loc,generator,async);
        }
        this.visitParams(body.value,methodId);
        this.visitBody(body.value.body.body,methodId);
      } else if(body.type == "ClassExpression"){
        let isDefineExport = false;
        let isVar = false;
        this.visitClassExp(parentId,body,codeSnippet,loc,propName,body.type,isDefineExport,isLeftAssign,isModify,isVar);
      } else if(valueType == "AssignmentPattern"){
        this.visitBinary(body.value,parentId);
      } else {
        let propId = this.processEn.processProperty(parentId,propName,loc,isLeftAssign,isModify,isStatic);
        if(valueType == "ArrowFunctionExpression"){
          let generator = body.value.generator;
          let async = body.value.async;
          this.visitUnNamedFunction(body.value,propName,parentId,codeSnippet,generator,async,true);
      } else if(valueType == "MemberExpression"){
        let calleeStr = this.visitCoreMemberName(body.value,parentId);
        calleeStr = this.processEn.formalizeStr(calleeStr);
        if(calleeStr.includes("()") || calleeStr.startsWith("new ")){
          this.processEn.processCallee(parentId,calleeStr);
        }else{
          this.processEn.processProperty(propId,calleeStr,loc,!isLeftAssign,isModify,isStatic);
        }
      } else if(valueType == "ObjectExpression"){
        this.visitBody(body.value.properties,propId);
      } else if(valueType == "UpdateExpression"){
        this.visitUpdateExp(body.value,propId);
      } else if(valueType == "TemplateLiteral"){
        this.visitBody(body.value.expressions,propId);
      } else if(valueType == "ObjectPattern"){
        this.visitBody(body.value.properties,propId);
      } else {
        this.visitType(body.value,parentId);
      }
    }
  }

  visitVar(body:any,parentId:number){
    let kind;
    let isLeftAssign = false;
    let isModify = false;
    let isDefineExported = false;
    let isStatic = false;
    let parentObj = (Array.from(this.singleCollect.getEntities()))[parentId];
    if(parentObj instanceof ModuleEntity){
      kind = "GlobalVar";
    }else{
      kind = "LocalVar";
    }
    if(body.type == "VariableDeclaration" && body.declarations.length > 0){
      for(let dec of body.declarations) {
        this.visitLeft(dec,dec,parentId,kind,isDefineExported)
      }
    } else if(body.type == "MemberExpression"){
      let memberName = this.visitCoreMemberName(body,parentId);
      memberName = this.processEn.formalizeStr(memberName);
      if(memberName.includes("()") || memberName.startsWith("new ")){
        this.processEn.processCallee(parentId,memberName);
      }
      this.processEn.processLocOrGloName(parentId,memberName,isLeftAssign,isModify);
    } else if(body.type == "ObjectPattern"){
      for(let prop of body.properties){
        if(prop.type == "ObjectProperty"){
          if(prop.static){
            isStatic = prop.static;
          }
          this.visitProperty(prop,parentId,isStatic);
        }
      }
    } else {
      this.visitType(body,parentId);
    }
  }

  visitBinary(body:any,parentId:number){
    if(body.left){
      this.visitVar(body.left,parentId);
    }
    if(body.operator == "instanceof") {
      let funcName = "";
      if(body.right.type == "Identifier") {
        funcName = body.right.name;
      } else if(body.right.type == "MemberExpression") {
        funcName = this.processEn.formalizeStr(this.visitCoreMemberName(body.right,parentId));
      }
      this.processEn.processInstanceOf(funcName,parentId);
    }
    if(body.right){
      this.visitVar(body.right,parentId);
    }
  }

  visitSuperClassName(path:any,parentId:number){
    let baseStr = "";
    if(path.type == "Identifier"){
      baseStr = path.name;
    }else if(path.type == "MemberExpression"){
      baseStr = this.processEn.formalizeStr(this.visitCoreMemberName(path,parentId));
    }else if(path.type == "ClassExpression"){
      baseStr = path.superClass.name;
    }
    return baseStr;
  }


  visitParams(path:any,parentId:number){
    let paraId;
    let paramName;
    let isLeftAssign = false;
    let isModify = false;
    if(path.params && path.params.length > 0){
      for(let param of path.params){
        if(param.type == "Identifier"){
          paramName = param.name;
        }else if(param.type =="AssignmentPattern"){
          paramName = param.left.name;
          this.visitBinary(param,parentId)
        }else if(param.type == "RestElement"){
          paramName = param.argument.name;
        }else if(param.type == "ObjectPattern"){
          for(let para of param.properties){
            if(para.type == "ObjectProperty"){
              let isStatic = false;
              if(para.static){
                isStatic = para.static;
              }
              this.visitProperty(para,parentId,isStatic);
            }
          }
          return;
        }
        paraId = this.processEn.processParameter(parentId,paramName,isLeftAssign,isModify);
      }
    }
  }

  /**
   * Visit an ImportStatement
   * import * as Per from "./file1.js"; import {Person} from ""; import Person from ""; import "./file/file1.js";
   */
  visitImportStatement() {
    let that = this;
    traverse(that.ast, {
      ImportDeclaration(path: any) {
        if (path.node.specifiers.length > 0) {
          for (let specifier of path.node.specifiers) {
            if (specifier.type == "ImportNamespaceSpecifier" || specifier.type == "ImportSpecifier"
                || specifier.type == "ImportDefaultSpecifier") {
              that.visitImpStmt(path,specifier);
            }
          }
        } else {
          that.visitImpStmt(path,-1);
        }
      }
    });
  }


  visitImpStmt(path:any,specifier:any){
    let localImportStr;
    let importStr;
    let as = "";
    let importStmts = new Set<ImportStmt>();
    let isImport = false;
    let isLeftAssign = false;
    let isModify = false;
    let from = path.node.source.value;
    let loc = this.visitLoc(path.node,this.moduleId);
    from = this.visitImportFromName(from);
    if(specifier != -1){
      if(specifier.imported){
        importStr = specifier.imported.name;
        localImportStr = specifier.local.name;
        this.processEn.processVar(this.moduleId,importStr,"",path.toString(),loc,"GlobalVar",false,isLeftAssign,isModify);
        if (importStr !== localImportStr) {
          as = localImportStr;
          let varId = this.processEn.processVar(this.moduleId,as,"",path.toString(),loc,"GlobalVar",false,isLeftAssign,isModify);
          if(varId !== -1){
            this.processEn.processAlias(importStr,varId,this.moduleId,!isImport);
          }
        }
      }else{
        if(specifier.type == "ImportNamespaceSpecifier"){
          as = specifier.local.name;
          importStr = "*";
          let varId = this.processEn.processVar(this.moduleId,as,"",path.toString(),loc,"GlobalVar",false,isLeftAssign,isModify);
          //import * as Per from "./file1.js";  file1 alias per
          if(varId !== -1){
            this.processEn.processAlias(from,varId,this.moduleId,!isImport);
          }
        }else{
          //import a from ""
          importStr = specifier.local.name;
          let varId = this.processEn.processVar(this.moduleId,importStr,"",path.toString(),loc,"GlobalVar",false,isLeftAssign,isModify);
          this.processEn.processAlias(importStr,varId,this.moduleId,!isImport);
          //importStr = "";
        }
      }
    }else{
      //import "./**"
      importStr = from;
      from = "";
    }
    let importStmt = new ImportStmt(from, importStr, as);
    importStmts.add(importStmt);
    this.processEn.saveImportsInModule(importStmts, this.moduleId);
  }


  visitImportFromName(from:string){
    let fromPath = from.substring(from.lastIndexOf("/") + 1 ,from.length);
    return fromPath;
  }

  /**
   * process the exportStatement and save it into ModuleEntity
   * eg. export{a, B as b}
   */
  visitExportNamedDeclaration(){
    let that = this;
    traverse(that.ast, {
      ExportNamedDeclaration(path: any) {
        let isDefault = false;
        if (path.node.specifiers.length > 0) {
          for (let specifier of path.node.specifiers) {
            if (specifier.type == "ExportSpecifier") {
              let localName;
              let exportedName;
              if(specifier.local){
                localName = specifier.local.name;
                exportedName = specifier.exported.name;
                if(localName == exportedName){
                  //export {a};
                  let exportId = that.processEn.findExportId(exportedName,that.moduleId);
                  that.processEn.processDeclareExport(that.moduleId,exportedName,exportId,isDefault);
                }else{
                  //export {a as b};  b是define Export,a alias ee
                  let isLeftAssign = false;
                  let isModify = false;
                  let codeSnippet = path.toString();
                  let loc = that.visitLoc(path.node,that.moduleId);
                  let kind = "GlobalVar";
                  let varId = that.processEn.processVar(that.moduleId,exportedName,"",codeSnippet,loc,kind,true,isLeftAssign,isModify);
                  that.processEn.processAlias(localName,varId,that.moduleId,false);
                }
              }
            }
          }
        }
      }
    });
  }

  visitExportDefaultDeclaration(){
    let that = this;
    traverse(that.ast, {
      ExportDefaultDeclaration(path: any) {
        let exportedName;
        let isDefault = true;
        if(path.node.declaration.type == "Identifier"){
          //export default A
          exportedName = path.node.declaration.name;
          //应该在当前文件中找func
          let exportId = that.processEn.findExportId(exportedName,that.moduleId);
          that.processEn.processDeclareExport(that.moduleId,exportedName,exportId,isDefault);
        }else if(path.node.declaration.type == "MemberExpression"){
          //export default A.e
          let isLeftAssign = false;
          let isModify = false;
          exportedName = that.processEn.formalizeStr(that.visitCoreMemberName(path.node.declaration,that.moduleId));
          that.processEn.processLocOrGloName(that.moduleId,exportedName,isLeftAssign,isModify);
        }else if(path.node.declaration.type == "FunctionDeclaration" || path.node.declaration.type == "ClassDeclaration"){
          //处理Declaration时已经处理过了
        } else {
          that.visitType(path.node.declaration,that.moduleId);
        }
      }
    });
  }

}


// const content = fs.readFileSync("F:\\test\\test\\algorithms\\backtracking\\rat-in-maze.js", 'utf-8');
// let ast = parser.parse(content,{plugins:['classProperties','jsx'],sourceType:"module"});
// var e = new EntityVisitor("F:\\test\\test\\algorithms\\backtracking\\rat-in-maze.js",ast,content);
// e.visitAll()
export default EntityVisitor;