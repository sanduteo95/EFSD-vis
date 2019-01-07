define(function () {
    // needed by nodes/mod, nodes/prov, nodes/dep

    function isNumber (n) {
        return !isNaN(parseFloat(n)) && isFinite(n);
    }

    var graph = null;
    return {
        isNumber: isNumber,
        graph: graph
    }
});