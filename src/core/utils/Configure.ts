import * as os from "os";

class Configure {
    public static BASIC_ENTITY_METHOD = "method";
    public static BASIC_ENTITY_CLASS = "class";
    public static BASIC_ENTITY_FILE = "file";
    public static BASIC_ENTITY_PACKAGE = "package";

    //file->package
    public static RELATION_IMPORT = "Import";
    //package.class->file
    public static RELATION_IMPORTED_BY = "Imported by";
    public static RELATION_UNRESOLVEDIMPORT = "UnresolvedImport";
    public static RELATION_UNRESOLVEDIMPORTED_BY = "UnresolvedImport by";
    //file->package
    public static RELATION_IMPORTFROM = "ImportFrom";
    //package.class->file
    public static RELATION_IMPORTEDFROM_BY = "ImportedFrom by";

    //function-var; function->method; method->var; function->function
    public static  RELATION_DEFINE = "Define";
    public static  RELATION_DEFINED_BY = "Defined by";

    //function-function; function->method; method->function; method->method
    public static  RELATION_CALL = "Call";
    public static  RELATION_CALLED_BY = "Called by";

    public static  RELATION_POSSIBLECALL = "PossibleCall";
    public static  RELATION_POSSIBLECALLED_BY = "PossibleCalled by";

    //function->function
    public static  RELATION_CALL_NEW = "CallNew";
    public static  RELATION_CALLED_NEW_BY = "CalledNew by";

    public static  RELATION_POSSIBLECALL_NEW = "PossibleCallNew";
    public static  RELATION_POSSIBLECALLED_NEW_BY = "PossibleCalledNew by";

    //function->function
    public static  RELATION_CALLPOINTER = "CallPointer";
    public static  RELATION_CALLPOINTERED_BY = "CallPointered by";


    public static  RELATION_EXTEND = "Extend";
    public static  RELATION_EXTENDED_BY = "Extended by";

    //function/method->OperandVar
    public static  RELATION_SET = "Set";
    public static  RELATION_SETED_BY = "Seted by";

    //function/method->OperandVar
    public static  RELATION_USE = "Use";
    public static  RELATION_USED_BY = "Used by";

    //function/method->OperandVar
    public static  RELATION_INIT = "Init";
    public static  RELATION_INITED_BY = "Inited by";

    //function/method->OperandVar
    public static  RELATION_MODIFY = "Modify";
    public static  RELATION_MODIFIED_BY = "Modified by";

    public static RELATION_DEFINEEXPORT = "DefineExport";
    public static RELATION_DEFINEEXPORTED_BY = "DefineExported by";

    public static RELATION_DEFINEDEFAULTEXPORT = "DefineDefaultExport";
    public static RELATION_DEFINEDEFAULTEXPORTED_BY = "DefineDefaultExported by";

    public static RELATION_DECLAREEXPORT = "DeclareExport";
    public static RELATION_DECLAREEXPORTED_BY = "DeclareExported by";

    public static RELATION_DECLAREDEFAULTEXPORT = "DeclareDefaultExport";
    public static RELATION_DECLAREDEFAULTEXPORTED_BY = "DeclareDefaultExported by";

    public static RELATION_DEFINESET = "DefineSet";
    public static RELATION_DEFINESETED_BY = "DefineSeted by";

    public static RELATION_ALIAS = "Alias";
    public static RELATION_ALIASED_BY = "Aliased by";

    private static configure = new Configure();

    public static getConfigureInstance() {
        return this.configure;
    }

    static isBuiltInFunction(funcName:string){
        if(funcName =="Array" || funcName =="Object" || funcName == "console" || funcName == "toString"||
            funcName =="Date" || funcName =="BigInt" || funcName == "ERROR" || funcName == "Map" ||
            funcName == "Set" || funcName =="isNaN" || funcName == "Math" || funcName == "String" ||
            funcName == "Symbol" || funcName =="Promise" || funcName == "parseInt" || funcName == "parseFloat" ||
            funcName == "arguments" || funcName =="encodeURIComponent" || funcName == "eval" || funcName == "JSON" ||
            funcName == "location" || funcName =="NaN" || funcName == "navigator" || funcName == "Number" ||
            funcName == "RegExp" || funcName =="SyntaxError" || funcName == "TypeError" || funcName == "undefined" ||
            funcName == "window" || funcName =="Infinity" || funcName == "ArrayBuffer" || funcName == "DataView" ||
            funcName == "Float32Array" || funcName =="Float64Array" || funcName == "Function" || funcName == "Int16Array" ||
            funcName == "Int32Array" || funcName =="Int8Array" || funcName == "Uint8Array" || funcName == "Uint16Array" ||
            funcName == "Uint32Array" || funcName =="Uint8ClampedArray" || funcName == "encodeURI" || funcName == "AsyncFunction" ||
            funcName == "log" || funcName =="AggregateError" || funcName == "Atomics" || funcName =="BigInt64Array" ||
            funcName == "BigUint64Array" || funcName =="decodeURI" || funcName == "decodeURIComponent" || funcName =="EvalError" ||
            funcName == "FinalizationRegistry" || funcName =="Generator" || funcName == "GeneratorFunction" || funcName =="globalThis" ||
            funcName == "InternalError" || funcName =="Intl" || funcName == "isFinite" || funcName =="null" ||
            funcName == "Proxy" || funcName =="RangeError" || funcName == "ReferenceError" || funcName =="Reflect" ||
            funcName == "SharedArrayBuffer" || funcName =="TypedArray" || funcName == "URIError" || funcName =="WeakMap" ||
            funcName == "WeakRef" || funcName =="WeakSet" || funcName == "WebAssembly" ){
            return true;
        }else{
            return false;
        }
    }

    private inputSrcPath = "";
    private usageSrcPath = "";
    private analyzedProjectName = "";
    private lang = "JavaScript";
    private curr_pro_suffix = "";

    setLang(lang:string) {
        if(lang == "JavaScript") {
            this.curr_pro_suffix = ".js";
        }
    }

    getLang() {
        return this.lang;
    }

    setInputSrcPath(inputSrcPath:string) {
        this.inputSrcPath = inputSrcPath;
    }

    setUsageSrcPath(usageSrcPath:string) {
        this.usageSrcPath = usageSrcPath;
    }

    setAnalyzedProjectName(analyzedProjectName:string) {
        var type = os.type();
        if(type == "Windows_NT"){
            this.analyzedProjectName = analyzedProjectName + "-out\\" + analyzedProjectName;
        }
        if(type == "linux" || type == "Darwin"){
            this.analyzedProjectName = analyzedProjectName + "-out/" + analyzedProjectName;
        }
    }

     getAnalyzedProjectName(){
       return this.analyzedProjectName;
     }

    private outputDotFile = this.analyzedProjectName + ".dot";
    private outputCsvNodeFile = this.analyzedProjectName + "_node.csv";
    private outputCsvEdgeFile = this.analyzedProjectName + "_edge.csv";
    private outputJsonFile = this.analyzedProjectName  + "_dep.json";
    private outputNodeJsonFile = this.analyzedProjectName  + "_node.json";
    private outputEdgeJsonFile = this.analyzedProjectName  + "_edge.json";
    private outputXmlFile = this.analyzedProjectName + "_dep.xml";
    private attributeName = this.analyzedProjectName + "-sdsm";
    private schemaVersion = "1.0";

    setDefault() {
        this.outputJsonFile = this.analyzedProjectName  + "_dep.json";
        this.outputNodeJsonFile = this.analyzedProjectName  + "_node.json";
        this.outputEdgeJsonFile = this.analyzedProjectName  + "_edge.json";
        this.outputDotFile = this.analyzedProjectName + ".dot";
        this.outputXmlFile = this.analyzedProjectName + "_dep.xml";
        this.outputCsvNodeFile = this.analyzedProjectName + "_node.csv";
        this.outputCsvEdgeFile = this.analyzedProjectName + "_edge.csv";
        this.attributeName = this.analyzedProjectName + "-sdsm";
    }

    getAttributeName() {
        return this.attributeName;
    }

    setAttributeName(attributeName:string) {
        this.attributeName = attributeName;
    }

    setSchemaVersion(schemaVersion:string) {
        this.schemaVersion = schemaVersion;
    }

    getSchemaVersion() {
        return this.schemaVersion;
    }

    setOutputJsonFile(outputJsonFile:string) {
        this.outputJsonFile = outputJsonFile;
    }

    getOutputJsonFile() {
        return this.outputJsonFile;
    }

    getOutputNodeJsonFile() {
        return this.outputNodeJsonFile;
    }

    getOutputEdgeJsonFile() {
        return this.outputEdgeJsonFile;
    }
}
export default Configure;