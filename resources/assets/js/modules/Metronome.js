define([ "HelperFunctions", "AudioContext", "MasterChannel" ], function( hf, ac, Master ) {
    "use strict";

    let T = {};

    function Metronome() {
        T = this;
        this.sequence = [1,1,1,1];
        this.root = 0;
        this.volume = 0.0;
        this.waveType = "sine";
        this.clickLength = 0.0001;
    }
    /***************************************************
     *
     *                  Private
     *
     ***************************************************/
        // 00 01 02 03 04 05 06 07 08 09 10 11
        // C  Db D  Eb E  F  Gb G  Ab A  Bb B
        let notes = [
            261.626,
            277.183,
            293.665,
            311.127,
            329.628,
            349.228,
            369.994,
            391.995,
            415.305,
            440,
            466.164,
            493.883 ],
        barNumber = 0,
        drawTimes = [],
        Notes = [],
        drawIndex = 0;

        function setOscOctave( osc, sequenceIndex ) {
            osc.type = T.waveType;

            if ( sequenceIndex % 16 == 0 )
                osc.frequency.value = notes[ T.root ] * 4;
            else if ( sequenceIndex % 4 == 0 )
                osc.frequency.value = notes[ T.root ] * 2;
            else
                osc.frequency.value = notes[ T.root ];
        }

        function setListeners() {
            let metronomeElement = hf.get("metronome");
            metronomeElement.addEventListener("mousedown", mousedown);
            metronomeElement.addEventListener("mouseup", mouseup);
        }

        function buildPads( sequence ) {
            hf.log( "Building Metronome" );
            for ( let i = 0; i < sequence.length; i++ )
            {
                T.addPad();
            }

            T.setSequence();
        }

        function mousedown( e ) {
            if ( e.target.classList.contains("metronomePad") )
            {
                let engaged = "engaged";
                if (  e.target.classList.contains( engaged ) )
                    e.target.classList.remove( engaged );
                else
                    e.target.classList.add( engaged );

                T.getSequence();
            }
            else if ( e.target.id === "metronomeAdd" )
            {
                T.addPad();
                T.getSequence();
            }
            else if ( e.target.id === "metronomeSub" )
            {
                T.subPad();
                T.getSequence();
            }
        }

        function mouseup( e ) {
            if ( e.target.id === "metronomeRoot" )
            {
                let value = e.target.value;
                T.root = value;
            }
            else if ( e.target.id === "metronomeType" )
            {
                let type = e.target.value;
                T.waveType = type;
            }
            else if ( e.target.id === "metronomeClickLength" )
            {
                T.clickLength = e.target.value;
            }
        }

    Metronome.prototype = {
        addPad: function() {
            let metronomeSequence = hf.get( "metronomeSequence" ),
                newPad = document.createElement( "div" ),
                pads = metronomeSequence.getElementsByClassName( "metronomePad" );

            newPad.classList.add( "metronomePad" );

            if ( pads.length % 4 === 0 )
            {
                let newBlock = document.createElement( "div" );
                newBlock.appendChild( newPad );
                metronomeSequence.appendChild( newBlock );
            }
            else
            {
                let lastBlock = metronomeSequence.children[ metronomeSequence.children.length - 1 ];
                lastBlock.appendChild( newPad );
            }
        },

        subPad: function() {
            let metronomeSequence = hf.get( "metronomeSequence" ),
                pads = metronomeSequence.getElementsByClassName( "metronomePad" );

            if ( pads.length >= 1 )
            {
                let lastPad = pads[ pads.length - 1 ];

                if ( lastPad.parentNode.children.length === 1 )
                    metronomeSequence.removeChild( lastPad.parentNode );
                else
                    lastPad.parentNode.removeChild( lastPad );
            }
        },

        setVolume: function( vol ) {
            T.volume = hf.clamp(vol, 0.0, 1.0);
        },

        setSequence: function() {
            let metronomeSequence = hf.get("metronomeSequence"),
                pads = metronomeSequence.getElementsByClassName("metronomePad");

            for ( let i = 0; i < T.sequence.length; i++ )
            {
                if (T.sequence[ i ] === 1)
                    pads[ i ].classList.add("engaged");
                else
                    pads[ i ].classList.remove("engaged");
            }
        },

        getSequence: function() {
            let metronomeSequence = hf.get("metronomeSequence"),
                pads = metronomeSequence.getElementsByClassName("metronomePad");

            T.sequence = [];
            for ( let i = 0; i < pads.length; i++ )
            {
                if ( pads[ i ].classList.contains( "engaged" ) )
                    T.sequence[ i ] = 1;
                else
                    T.sequence[ i ] = 0;
            }
        },

        setRootNote: function ( root ) {
            T.root = hf.clamp( root, 0, 11 );
        },

        createNote: function( noteLength, start, stop, sequenceIndex) {
            let osc = ac.createOscillator(),
                gain = ac.createGain(),
                clickLength = T.clickLength;

            osc.connect( gain );
            gain.connect( Master.input() );

            setOscOctave( osc, sequenceIndex );

            let noteEnd = parseFloat( start ) + parseFloat( clickLength );

            gain.gain.value = T.volume;
            gain.gain.
                setTargetAtTime( 0, noteEnd ,  clickLength * 10 );

            osc.start( start );
            osc.stop( noteEnd + clickLength * 30);

            Notes.push( osc );
        },

        barTick: function() {

        },

        resetDraw: function() {
            drawIndex = 0;
            drawTimes = [];
        },

        getDrawTimes: function() {
            return drawTimes;
        },

        draw: function() {
            let now = window.performance.now(),
                noteLength = drawTimes[ 1 ] - drawTimes[ 0 ];

            if ( now > drawTimes[ drawIndex ] )
            {
                let pads = hf.getElByCN("metronomePad");

                // Blank all pads
                for ( let i = 0; i < pads.length; i++ )
                    pads[ i ].classList.remove( "playing" );

                // Light up playing pad
                if ( drawIndex < pads.length )
                    pads[ drawIndex ].classList.add( "playing" );

                // Move to next pad
                drawIndex++;
            }
        },

        clear: function() {
            Notes = [];
        },

        stop: function( now ) {
            for ( let i = 0; i < Notes.length; i++ )
                Notes[ i ].stop( now );
        },

        setState: function( state ) {
            T.clickLength = state.clickLength;
            T.root = state.root;
            T.sequence = state.sequence;
            T.volume = state.volume;
            T.waveType = state.waveType;

            let root = hf.get( "metronomeRoot" ),
                type = hf.get( "metronomeType" ),
                clickLength = hf.get( "metronomeClickLength" ),
                volume = hf.get( "metronomeVolume" );

            root.value = T.root;
            type.value = T.waveType;
            clickLength.value = T.clickLength;
            volume.value = state.volume * 10;
        },

        init: function( state, callback ) {
            hf.log("Metronome init");
            let metronomeSequence = hf.get("metronomeSequence");


            if ( state )
                T.setState( state );

            buildPads( T.sequence );
            setListeners();
            T.setSequence();
        }
    };

    return Metronome;
});
