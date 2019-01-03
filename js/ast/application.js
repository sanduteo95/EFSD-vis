define('ast/application', function() {
    class Application {
      /**
       * (lhs rhs) - left-hand side and right-hand side of an application.
       */
      constructor(lhs, rhs) {
        this.lhs = lhs;
        this.rhs = rhs;
      }
    }
    return Application;
});