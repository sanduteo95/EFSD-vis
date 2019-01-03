define('ast/binary-op', ['ast/unary-op'], function(UnaryOp) {
    class BinaryOp extends UnaryOp {
      constructor(type, name, v1, v2) {
        super(type, name, v1);
        this.v2 = v2;
      }
    }
    return BinaryOp;
});