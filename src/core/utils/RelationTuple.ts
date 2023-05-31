class RelationTuple<X, Y>
{
    public x;
    public y;

    constructor(x:X,y:Y)
    {
        this.x = x;
        this.y = y;
    }

    getX(x:X) {
        return this.x;
    }

    getY(y:Y) {
        return this.y;
    }

   // setRelation(y:Y) {
   //  this.y = y;
   // }


   // setValue(id:Y) {
   //  return this.y = id;
   // }
}
export default RelationTuple;