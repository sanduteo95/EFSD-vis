define(function () {
    // needed by nodes/mod, nodes/prov, nodes/dep
    function isNumber (n) {
        return !isNaN(parseFloat(n)) && isFinite(n);
    }

    return {
        isNumber: isNumber,
        // needed by goi-machine, link and node
        graph: null
    };
});