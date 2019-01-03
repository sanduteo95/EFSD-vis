define('ast/change', function() {
    class Change {
      constructor(param, body) {
        this.param = param;
        this.body = body;
      }
    }
    return Change;
});