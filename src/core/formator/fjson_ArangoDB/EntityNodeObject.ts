//创建实体node对象 json文件 导入ArangoDB
//属性必须包含_key(entity.getId())
//数组中包含每个实体信息的集合
class entityNodeObject{
    private  _key = "";
    private  name = "";
    //private  type = "";

    get_key() {
        return this._key;
    }

    set_key(_key:string) {
        this._key = _key;
    }

    getEnSimpleName() {
        return this.name;
    }

    setName(name:string) {
        this.name = name;
    }

    // getType() {
    //     return this.type;
    // }
    //
    // setType(type:string) {
    //     this.type = type;
    // }

}
export default entityNodeObject