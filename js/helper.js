define(function () {
    // needed by nodes/mod, nodes/prov, nodes/dep

    return function isNumber (n) {
        return !isNaN(parseFloat(n)) && isFinite(n);
    };
});