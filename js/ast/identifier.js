define('ast/identifier', function() {
    class Identifier {
      /**
       * name is the string matched for this identifier.
       */
      constructor(value, name) {
        this.value = value;
        this.name = name;
      }
    }
    return Identifier;
});