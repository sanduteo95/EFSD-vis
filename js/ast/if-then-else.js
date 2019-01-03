define('ast/if-then-else', function() {
    class IfThenElse {
      constructor(cond, t1, t2) {
        this.cond = cond;
        this.t1 = t1;
        this.t2 = t2;
      }
    }
    return IfThenElse;
});