define([ "Piano", "Metronome" ], function( Piano, Metronome ) {
    "use strict";

    return [ new Metronome(), new Piano() ];
});
