define('ast/recursion', function() {
    class Recursion {
      constructor(param, body) {
        this.param = param;
        this.body = body;
      }
    }
    return Recursion;
});