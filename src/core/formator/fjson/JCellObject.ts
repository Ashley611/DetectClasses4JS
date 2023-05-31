class JCellObject{
    private  src = -1;
    private  dest = -1;
    // private  source = "";
    // private  target = "";
    private  values = new Map<string,number>();
    //private values = new Array();

    getSrc() {
        return this.src;
    }

    setSrc(source:number) {
        this.src = source;
    }
    // setSrc(source:string) {
    //     this.source = source;
    // }
    getDest() {
        return this.dest;
    }

    setDest(target:number) {
        this.dest = target;
    }

    // setDest(target:string) {
    //     this.target = target;
    // }

    setValues(values:Map<string, number>) {
        this.values = values;
    }

    getValues() {
        return this.values;
    }

    // setFinalValues(values:Map<string, number>){
    //     //console.log(values)
    //     let str = "";
    //     let arr = new Array();
    //     values.forEach(function (value, key, map){
    //         arr.push(key +": " +value)
    //     })
    //     this.values = arr;
    // }

    getFinalValues() {
        return this.values;
    }
}
export default JCellObject