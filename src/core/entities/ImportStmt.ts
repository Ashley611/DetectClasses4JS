class ImportStmt{
    private from = "";
    private impor = "";
    private as = "";

    constructor(from:string,impor:string,as:string) {
        this.from = from;
        this.impor = impor;
        this.as = as;
    }

    getImpor() {
        return this.impor;
    }

    getFrom() {
        return this.from;
    }

    getAs() {
        return this.as;
    }

    setImpor(impor:string) {
        this.impor = impor;
    }

    setAs(as:string) {
        this.as = as;
    }

    setFrom(from:string) {
        this.from = from;
    }
}
export default ImportStmt;