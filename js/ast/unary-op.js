define('ast/unary-op', ['ast/operation'], function(Operation) {    
    class UnaryOp extends Operation {
      constructor(type, name, v1) {
        super(type, name);
        this.v1 = v1;
      }
    }
    return UnaryOp;
});