define(function () {
    // needed by nodes/mod, nodes/prov, nodes/dep

    exports.isNumber = function (n) {
        return !isNaN(parseFloat(n)) && isFinite(n);
    };
});