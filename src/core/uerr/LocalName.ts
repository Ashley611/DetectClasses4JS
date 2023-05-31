
/**
 * LocalNameEntity is for the name appearing inside a function or method
 * it corresponds to the operandName, identifierList of shortVarDecl and VarDecl in grammar.
 * it maybe a local variable/constant, a file variable/constant, a packagename, a functioname, or system's method/pack,func/key.
 *
 * LocalName is valid only inside a function/method.
 * So, We bind a LocalName list to its functionEntity
 */
class LocalName{
    private name = "";    //operandName
    //private type = "";
    private value = "";
    //private localBlockId = -1;
    private usages = new Set<string>(); //{"use", "set"} or {package}
    //map={set, number}
    private weightedUsages = new Map<string, number>();


    constructor(name:string, value:string) {
        this.name = name;
        //this.localBlockId = localBlockId;
        //this.type = type;
        this.value = value;
    }


    getName() {
        return this.name;
    }

    setName(name:string) {
        this.name = name;
    }

    // getType() {
    //     return this.type;
    // }

    // setType(type:string) {
    //     this.type = type;
    // }
    //
    // getLocalBlockId() {
    //     return this.localBlockId;
    // }
    //
    // setLocalBlockId(localBlockId:number) {
    //     this.localBlockId = localBlockId;
    // }

    getValue() {
        return this.value;
    }

    setValue(value:string) {
        this.value = value;
    }

    getUsages() {
        return this.usages;
    }

    updateUsage(usage:string) {
        for (let oneUsage of this.usages) {
            if (usage === oneUsage) {
                return;
            }
        }
        this.usages.add(usage);
    }

    getWeightedUsages() {
        return this.weightedUsages;
    }

    updateWeighedUsage(usage:string) {
        if(this.weightedUsages.has(usage)) {
            // @ts-ignore
            this.weightedUsages.set(usage, this.weightedUsages.get(usage) + 1);
        }
        else {
            this.weightedUsages.set(usage, 1);
        }
    }
}
export default LocalName;
