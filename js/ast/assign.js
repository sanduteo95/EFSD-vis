define('ast/assign', function() {
    class Assign {
      constructor(param, body) {
        this.param = param;
        this.body = body;
      }
    }
    return Assign;
});