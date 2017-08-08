define(function() {
    "use strict";

    let instance = null;

    function GlobalState(){
        this.debug = true;
        this.isRunning = false;
        this.MaxLookAhead = 0.05;
        this.lookAhead = 0.02;
    }
    function getInstance() {
        if ( instance === null )
            instance = new GlobalState();

        return instance;
    }

    return getInstance();
});
