define('ast/abstraction', function() {
    class Abstraction {
      /**
       * param here is the name of the variable of the abstraction. Body is the
       * subtree  representing the body of the abstraction.
       */
      constructor(param, body) {
        this.param = param;
        this.body = body;
      }
    }
    return Abstraction;
});