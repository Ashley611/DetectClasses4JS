import CallVisitor from "./CallVisitor";
import ExtendVisitor from "./ExtendVisitor";
import ImportVisitor from "./ImportVisitor";
import DefineVisitor from "./DefineVisitor";
import PointerVisitor from "./CallPointerVisitor";
import InitVisitor from "./InitVisitor";
import CallNewVisitor from "./CallNewVisitor";
import NameSearch from "../searcher/NameSearch";
import UsageVisitor from "./UsageVisitor";
import DefineExportVisitor from "./DefineExportVisitor";
import DeclareExportVisitor from "./DeclareExportVisitor";
import AliasVisitor from "./AliasVisitor";
import DefineDefaultExportVisitor from "./DefineDefaultExportVisitor";
import DefineSetVisitor from "./DefineSetVisitor";
import ImportFromVisitor from "./ImportFromVisitor";
import UseVisitor from "./UseVisitor";
import SetVisitor from "./SetVisitor";
import ModifyVisitor from "./ModifyVisitor";
import DeclareExportDefaultVisitor from "./DeclareExportDefault";
import CallPointerVisitor from "./CallPointerVisitor";
import ClassDetecting from "./ClassDetecting";
import FunctionEntity from "../../entities/FunctionEntity";
import MethodEntity from "../../entities/MethodEntity";
import SingleCollect from "../../utils/SingleCollect";



class DepLyzer{
    identifyDeps(){
        // let importVistor = new ImportVisitor;
        // importVistor.setDep();
        // console.log("Import dependency identified successfully");
        //
        // let importFromVistor = new ImportFromVisitor;
        // importFromVistor.setDep();
        // console.log("ImportFrom dependency identified successfully");
        //
        // let defineVisitor = new DefineVisitor();
        // defineVisitor.setDep();
        // console.log("Define dependency identified successfully");
        //
        // let defineSetVisitor = new DefineSetVisitor();
        // defineSetVisitor.setDep();
        // console.log("DefineSetVisitor dependency identified successfully");
        //
        // let defineExportVisitor = new DefineExportVisitor();
        // defineExportVisitor.setDep();
        // console.log("DefineExportVisitor dependency identified successfully");
        //
        // let defineDefaultExportVisitor = new DefineDefaultExportVisitor();
        // defineDefaultExportVisitor.setDep();
        // console.log("DefineDefaultExportVisitor dependency identified successfully");
        //
        // let declareExportVisitor = new DeclareExportVisitor();
        // declareExportVisitor.setDep();
        // console.log("DeclareExportVisitor dependency identified successfully");
        //
        // let declareExportDefaultVisitor = new DeclareExportDefaultVisitor();
        // declareExportDefaultVisitor.setDep();
        // console.log("DeclareExportDefaultVisitor dependency identified successfully");
        //
        // let aliasVisitor = new AliasVisitor();
        // aliasVisitor.setDep();
        // console.log("AliasVisitor dependency identified successfully");
        //
        // let extendVisitor = new ExtendVisitor();
        // extendVisitor.setDep();
        // console.log("Extend dependency identified successfully");
        //
        // let callPointerVisitor = new CallPointerVisitor();
        // callPointerVisitor.setDep();
        // console.log("CallPointer dependency identified successfully");
        //
        // let initVisitor = new InitVisitor();
        // initVisitor.setDep();
        // console.log("Init dependency identified successfully");
        //
        let callNewVisitor = new CallNewVisitor();
        callNewVisitor.setDep();
        console.log("CallNew dependency identified successfully");

        let callVisitor = new CallVisitor();
        callVisitor.setDep();
        console.log("Call dependency identified successfully");
        //
        // let nameSearch = NameSearch.getNameSearchInstance();
        // nameSearch.buildNameScope();
        //
        // let usageVisitor = new UsageVisitor();
        // usageVisitor.buildUsage();
        //
        // let useVisitor = new UseVisitor();
        // useVisitor.setDep();
        // console.log("Use dependency identified successfully");
        //
        // let setVisitor = new SetVisitor();
        // setVisitor.setDep();
        // console.log("Set dependency identified successfully");
        //
        // let modifyVisitor = new ModifyVisitor();
        // modifyVisitor.setDep();
        // console.log("Modify dependency identified successfully");

        let classDetecting = new ClassDetecting();
        classDetecting.detectClass();
        console.log("Class detecting successfully");

        // for (let entity of this.singleCollect.getEntities()) {
        //     if(entity instanceof FunctionEntity || entity instanceof MethodEntity) {
        //         if(entity.getClassType.length !== 0) {
        //             console.log(entity)
        //         }
        //     }
        // }
    }
}
export default DepLyzer;