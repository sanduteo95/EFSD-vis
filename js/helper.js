define(function () {
    // needed by nodes/mod, nodes/prov, nodes/dep
    function isNumber (n) {
        return !isNaN(parseFloat(n)) && isFinite(n);
    }

    // needed by goi-machine, link and node
    var graph = null;

    return {
        isNumber: isNumber,
        graph: graph
    };
});