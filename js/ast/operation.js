define('ast/operation', function() {
    class Operation {
      constructor(type, name) {
        this.type = type;
        this.name = name;
      }
    }
    return Operation;
});