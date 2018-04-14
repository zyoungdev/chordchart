define(function() {
    "use strict";

    let T = {},
        instance = null;

    function GlobalState(){
        T = this;
        this.debug = true;
        this.isRunning = false;
        this.MaxLookAhead = 0.05;
        this.lookAhead = 0.02;
        this.fullscreen = false;
    }

    GlobalState.prototype = {
        setState: function( state ) {
            if ( !state )
                return;
            
            T.debug = state.debug;
            T.isRunning = state.isRunning;
            T.MaxLookAhead = state.MaxLookAhead;
            T.lookAhead = state.lookAhead;
        }
    };

    function getInstance() {
        if ( instance === null )
            instance = new GlobalState();

        return instance;
    }

    return getInstance();
});
