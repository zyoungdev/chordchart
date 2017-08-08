define([ "HelperFunctions" ], function( hf ) {
    "use strict";

    let AudioContext;
    try {
        AudioContext =
            new (window.AudioContext ||
                window.webkitAudioContext)();
    }
    catch (e) {
        hf.log("no Audio API");
        document.getElementById("loading").innerHTML = "Web Audio API not supported by your browser";
        return;
    }

    return AudioContext;
});
