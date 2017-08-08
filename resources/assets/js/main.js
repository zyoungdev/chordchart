require([ "Engine" ], function( Engine ) {
    "use strict";

    let engine = new Engine();
    engine.init();

    return {
        init: engine.init,
        setTempo: engine.setTempo,
        setupSequence: engine.setupSequence,
        play: engine.play,
        stop: engine.stop
    }
});

