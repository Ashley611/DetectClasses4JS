import SingleCollect from "../../utils/SingleCollect";
import RelationTuple from "../../utils/RelationTuple";

class DepVisitor {
    singleCollect = SingleCollect.getSingleCollectInstance();
    /**
     * relationType1: entityId1 -> entityId2
     * relationType2: entityId2 -> entityId1
     * @param entityId1   number//最终json格式需求为string
     * @param entityId2
     * @param relationType1
     * @param relationType2
     */
    saveRelation(entityId1:number, entityId2:number, relationType1:string, relationType2:string) {
        let relation1 = new RelationTuple<string, number>(relationType1,entityId2);
        let entityObj1 = (Array.from(this.singleCollect.getEntities()))[entityId1];
        if(entityObj1 !== undefined){
            entityObj1.addRelation(relation1);
        }


        //console.log(entityObj1.getRelations())
        let relation2 = new RelationTuple<string,number>(relationType2,entityId1);
        let entityObj2 = (Array.from(this.singleCollect.getEntities()))[entityId2];
        if(entityObj2 !== undefined){
            entityObj2.addRelation(relation2);
        }
       //console.log(entityObj2.getRelations())
    }
}

 export default DepVisitor;