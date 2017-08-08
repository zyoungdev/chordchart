define([ "HelperFunctions", "AudioContext" ], function( hf, ac ) {
    "use strict";

    let instance = null,
        T = {};

    function MasterChannel() {
        T = this;

        // FX Chain
        // Order of FX 
        //     0 = first FX Node
        //     .
        //     n - 1 = last FX Node
        this.FX = [];
        this.Limiter = {};
        this.Volume = {};
    }

    MasterChannel.prototype = {
        input: function() {
            return T.FX[ 0 ];
        },
        init: function() {
            T.Limiter = ac.createDynamicsCompressor();
            T.Volume = ac.createGain();

            T.Limiter.threshold.value = 0;
            T.Limiter.knee.value = 0;
            T.Limiter.ratio.value = 20;
            T.Limiter.attack.value = 0;
            T.Limiter.release.value = 0.1;

            T.Volume.gain.value = 1.0;

            T.FX = [ this.Limiter, this.Volume ];

            for ( let node = 0; node < T.FX.length - 1; node++ )
                T.FX[ node ].connect( T.FX[ node + 1 ] );

            T.FX[ T.FX.length - 1 ].connect( ac.destination );
        },
        setVolume: function( vol ) {
            T.Volume.gain.value = hf.clamp( vol, 0.0, 1.0 );
        }
    };

    function getInstance()
    {
        if ( instance === null )
            instance = new MasterChannel();

        return instance;
    }

    return getInstance();
});
