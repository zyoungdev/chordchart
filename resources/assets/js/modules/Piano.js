define([  "HelperFunctions", "GlobalState", "AudioContext", "BufferLoader", "MasterChannel", "Chart" ], function( hf, gs, ac, BufferLoader, Master, Chart ) {
    "use strict";

    let T = {};

    function Piano() {
        T = this;
        this.transpose = 0;
        this.additionalNoteLength = 1;
        this.volume = 1;
        this.playableOctave = 2;
        this.sequence = [1,1,1,1];
    }

    /***************************************************
     *
     *                  Private
     *
     ***************************************************/
        let pianoSamples = {},
            drawTimes = [],
            drawIndex = 0,
            keysDown = {},
            Notes = [],
            notes = {
                "C" : 0,
                "Db" : 1,
                "C#" : 1,
                "D" : 2,
                "Eb" : 3,
                "D#" : 3,
                "E" : 4,
                "F" : 5,
                "Gb" : 6,
                "F#" : 6,
                "G" : 7,
                "Ab" : 8,
                "G#" : 8,
                "A" : 9,
                "Bb" : 10,
                "A#" : 10,
                "B" : 11
            },

            // C  Db D  Eb E  F  Gb G  Ab A  Bb B
            // 00 01 02 03 04 05 06 07 08 09 10 11
            // 12 13 14 15 16 17 18 19 20 21 22 23
            chords = {
                // 1 3 5 maj 1
                "\u25B3" : [0, 16, 7, 11, 12],
                // 1 3 5 maj 9
                "\u25B39" : [0, 4, 19, 11, 14],
                // 1 3 5 7 1
                "7" : [0, 16, 7, 10, 12],
                // 1 3 7 9
                "9" : [0, 4, 19, 10, 14],
                // 1 b3 5 7 1
                "-7" : [0, 15, 7, 10, 12],
                // 1 3 #5 7 1
                "+7" : [0, 16, 8, 10, 12],
                // 1 b3 b5 7 1
                "\u00D8" : [0, 15, 6, 10, 12],
                // 1 b3 b5 b7
                "O" : [0, 15, 6, 9, 12],
                // 1 b3 5 maj 1
                "-\u25B3" : [0, 15, 7, 11, 12],
                // 1 3 #5 maj 1
                "\u25B3#5" : [0, 16, 8, 11, 12],
                // 1 3 b5 7 1
                "7#11" : [0, 15, 6, 10, 12],
                // 1 3 5 7 #9
                "7#9" : [0, 4, 19, 10, 15],
                // 1 3 #5 7 #9
                "7#5#9" : [0, 4, 20, 10, 15],
                // 1 3 5 7 b9
                "7b9" : [0, 4, 19, 10, 13],
                // 1 3 5 7 9
                "-9" : [0, 3, 19, 10, 14],
                // 1 b3 5 7 b9
                "-7b9" : [0, 3, 19, 10, 13],
                // 1 3 5 1
                "Maj" : [0, 16, 7, 12],
                // 1 b3 5 1
                "Min" : [0, 15, 7, 12]
            },

            keyboardKeys = {
                "a": 0,
                "w": 1,
                "s": 2,
                "e": 3,
                "d": 4,
                "f": 5,
                "t": 6,
                "g": 7,
                "y": 8,
                "h": 9,
                "u": 10,
                "j": 11,
                "k": 12
            },

            keyDownMap = {
                "x": function( e ) { if ( !e.ctrlKey ) { setOctave( 1 ); } },
                "z": function( e ) { if ( !e.ctrlKey ) { setOctave( -1 ); } },

                "a": function( e ) { scheduleKeyboardNote( e ); },
                "w": function( e ) { scheduleKeyboardNote( e ); },
                "s": function( e ) { scheduleKeyboardNote( e ); },
                "e": function( e ) { scheduleKeyboardNote( e ); },
                "d": function( e ) { scheduleKeyboardNote( e ); },
                "f": function( e ) { scheduleKeyboardNote( e ); },
                "t": function( e ) { scheduleKeyboardNote( e ); },
                "g": function( e ) { scheduleKeyboardNote( e ); },
                "y": function( e ) { scheduleKeyboardNote( e ); },
                "h": function( e ) { scheduleKeyboardNote( e ); },
                "u": function( e ) { scheduleKeyboardNote( e ); },
                "j": function( e ) { scheduleKeyboardNote( e ); },
                "k": function( e ) { scheduleKeyboardNote( e ); }
            };

        function setListeners() {
            let pianoElement = hf.get( "piano" );

            pianoElement.addEventListener( "mousedown", mousedown );
            pianoElement.addEventListener( "mouseup", mouseup );
            window.addEventListener( "keydown", keydown );
            window.addEventListener( "keyup", keyup );
        }

        function buildPads( sequence ) {
            for ( let i = 0; i < sequence.length; i++ )
            {
                T.addPad();
            }

            T.setSequence();
        }

        function scheduleKeyboardNote( e ) {
            let theNote = keyboardKeys[ e.key ];
            if ( theNote || theNote === 0 )
                scheduleNote( theNote, e.key );
        }

        function scheduleNote( noteNumber, key ) {
            let noteNum = noteNumber + 12 * T.playableOctave,
                Note, Gain = ac.createGain();

            Gain.gain.value = 2;
            Note = ac.createBufferSource();
            Note.buffer = 
                pianoSamples.bufferList[ noteNum ];
            Note.connect( Gain );
            Note.start( 0 );

            Gain.connect( Master.input() );

            keysDown[ key ] = {"note": Note, "gain": Gain};
        }

        function setOctave( oct ) {
            T.playableOctave += oct;

            if ( T.playableOctave < 0 )
                T.playableOctave = 0;
            else if ( T.playableOctave > 3 )
                T.playableOctave = 3;
        }

        function keydown( e ) {
            // If inputting text
            if ( document.activeElement.tagName === "INPUT" || document.activeElement.tagName === "TEXTAREA")
                return;

            // If the key is already down
            if ( keysDown[ e.key ] )
                return;

            let action = keyDownMap[ e.key ];
            if ( action )
                action( e );
        }

        function keyup( e ) {
            let Key = keysDown[ e.key ];
            if ( !Key )
                return;

            let Note = Key[ "note" ],
                Gain = Key[ "gain" ],
                stopTime = ac.currentTime + 0.4;

            Gain.gain.
                linearRampToValueAtTime( 0.01, stopTime );
            Note.stop( stopTime );

            keysDown[ e.key ] = false;
        }

        function mousedown( e ) {
            if ( e.which === 1 )
            {
                if ( e.target.classList.contains("pianoPad") )
                {
                    let engaged = "engaged";
                    if (  e.target.classList.contains( engaged ) )
                        e.target.classList.remove( engaged );
                    else
                        e.target.classList.add( engaged );

                    T.getSequence();
                }
                else if ( e.target.id === "pianoAdd" )
                {
                    T.addPad();
                    T.getSequence();
                }
                else if ( e.target.id === "pianoSub" )
                {
                    T.subPad();
                    T.getSequence();
                }
                else if ( e.target.classList.contains( "pianoNavButton" ) )
                {
                    let button = e.target,
                        buttonText = e.target.innerHTML;

                    if ( buttonText === "Piano Controls" )
                    {
                        let controls = hf.get( "pianoControls" );

                        if ( controls.classList.contains( "hide" ) )
                        {
                            controls.classList.remove( "hide" );
                            button.classList.add( "activeButton" );
                        }
                        else
                        {
                            controls.classList.add( "hide" );
                            button.classList.remove( "activeButton" );
                        }
                    }
                    else if ( buttonText === "Piano Sequencer" )
                    {
                        let sequencer = hf.get( "pianoSequence" );

                        if ( sequencer.classList.contains( "hide" ) )
                        {
                            sequencer.classList.remove( "hide" );
                            button.classList.add( "activeButton" );
                        }
                        else
                        {
                            sequencer.classList.add( "hide" );
                            button.classList.remove( "activeButton" );
                        }
                    }
                }
            }
        }

        function mouseup( e ) {
            if ( e.target.id === "pianoTranspose" )
            {
                T.transpose = parseInt( e.target.value );
            }
            else if ( e.target.id === "pianoAdditionalNoteLength" )
            {
                T.additionalNoteLength = parseInt( e.target.value );
            }
        }

    Piano.prototype = {
        addPad: function() {
            let pianoSequence = hf.get( "pianoSequenceContainer" ),
                newPad = document.createElement( "div" ),
                pads = pianoSequence.getElementsByClassName( "pianoPad" );

            newPad.classList.add( "pianoPad", "pad" );

            if ( pads.length % 4 === 0 )
            {
                let newBlock = document.createElement( "div" );
                newBlock.appendChild( newPad );
                pianoSequence.appendChild( newBlock );
            }
            else
            {
                let lastBlock = pianoSequence.children[ pianoSequence.children.length - 1 ];
                lastBlock.appendChild( newPad );
            }
        },

        subPad: function() {
            let pianoSequence = hf.get( "pianoSequenceContainer" ),
                pads = pianoSequence.getElementsByClassName( "pianoPad" );

            if ( pads.length >= 1 )
            {
                let lastPad = pads[ pads.length - 1 ];

                if ( lastPad.parentNode.children.length === 1 )
                    pianoSequence.removeChild( lastPad.parentNode );
                else
                    lastPad.parentNode.removeChild( lastPad );
            }
        },

        setVolume: function ( vol ) {
            T.volume = hf.clamp(vol, 0.0, 2.0);
        },

        setAdditionalNoteLength: function( len ) {
            T.additionalNoteLength = len;
        },

        setSequence: function() {
            let pianoSequence = hf.get("pianoSequence"),
                pads = pianoSequence.getElementsByClassName("pianoPad");

            for ( let i = 0; i < T.sequence.length; i++ )
            {
                if (T.sequence[ i ] === 1)
                    pads[ i ].classList.add("engaged");
                else
                    pads[ i ].classList.remove("engaged");
            }
        },

        getSequence: function() {
            let pianoSequence = hf.get("pianoSequence"),
                pads = pianoSequence.getElementsByClassName("pianoPad");

            T.sequence = [];
            for ( let i = 0; i < pads.length; i++ )
            {
                if ( pads[ i ].classList.contains( "engaged" ) )
                    T.sequence[ i ] = 1;
                else
                    T.sequence[ i ] = 0;
            }
        },

        getSequenceVal: function() {
            return T.sequence;
        },

        createNote: function( noteLength, start, stop, sequenceIndex ) {
            if ( Chart.getCurrentBar().chordName === "" || Chart.getCurrentBar().chordQuality === "" )
                return;

            let root = notes[ Chart.getCurrentBar().chordName ],
                chord = chords[ Chart.getCurrentBar().chordQuality ].slice();

            root += T.transpose;

            while ( root > 24 )
                root -= 12;
            while ( root < 8 )
                root += 12;

            // Only create one gainNode for all notes in chord
            let Note, Gain = ac.createGain(),
                tailLength = noteLength * T.additionalNoteLength,
                noteEndTime = stop + tailLength,
                halfNoteLength = noteLength / 2;

            Gain.gain.value = T.volume;

            for ( let chordIndex = 0; chordIndex < chord.length; chordIndex++ )
            {
                let randomOffset = ( Math.random() * 0.03 ) + 0.01;
                chord[ chordIndex ] += root;

                while ( chord[ chordIndex ] >= pianoSamples.bufferList.length )
                    chord[ chordIndex ] -= 12;
                while ( chord[ chordIndex ] < 0 )
                    chord[ chordIndex ] += 12;

                // Must create new bufferSource for each note
                Note = ac.createBufferSource();
                Note.buffer = 
                    pianoSamples.bufferList[ chord[ chordIndex ] ];
                Note.connect( Gain );
                Note.start( start + randomOffset );
                Note.stop( noteEndTime + 0.02 );

                Notes.push( Note );
            }


            // Fade out until time
            Gain.gain.
                linearRampToValueAtTime( 0.01, noteEndTime );

            // Ramp to value half way through note 
            Gain.gain.
                setTargetAtTime( 0.5, stop - halfNoteLength , 0.4 );

            // Remove Click
            Gain.gain.
                setTargetAtTime( 0, noteEndTime ,  0.015 );

            Gain.connect( Master.input() );
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
                nextDrawTime = drawTimes[ drawIndex ] + ( gs.lookAhead * 1000 );

            if ( now > nextDrawTime )
            {
                let pads = hf.getElByCN("pianoPad");

                // Blank all pads
                Array.prototype.forEach.call(pads, function( el ) {
                    el.classList.remove( "playing" );
                });

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
            T.additionalNoteLength = state.additionalNoteLength;
            T.playableOctave = state.playableOctave;
            T.sequence = state.sequence;
            T.transpose = state.transpose;
            T.volume = state.volume;

            let transpose = hf.get( "pianoTranspose" ),
                length = hf.get( "pianoAdditionalNoteLength" ),
                volume = hf.get( "pianoVolume" );

            transpose.value = T.transpose;
            length.value = T.additionalNoteLength;
            volume.value = state.volume * 10;
        },

        init: function( state, doneLoadingSamples_callback ) {
            hf.log("Piano init");

            pianoSamples = new BufferLoader(
                ac,
                [
                    'notes/C1.mp3', // 0
                    'notes/Db1.mp3',
                    'notes/D1.mp3',
                    'notes/Eb1.mp3',
                    'notes/E1.mp3',
                    'notes/F1.mp3',
                    'notes/Gb1.mp3',
                    'notes/G1.mp3',
                    'notes/Ab1.mp3',
                    'notes/A1.mp3',
                    'notes/Bb1.mp3',
                    'notes/B1.mp3',

                    'notes/C2.mp3', // 12
                    'notes/Db2.mp3',
                    'notes/D2.mp3',
                    'notes/Eb2.mp3',
                    'notes/E2.mp3',
                    'notes/F2.mp3',
                    'notes/Gb2.mp3',
                    'notes/G2.mp3',
                    'notes/Ab2.mp3',
                    'notes/A2.mp3',
                    'notes/Bb2.mp3',
                    'notes/B2.mp3',

                    'notes/C3.mp3', // 24
                    'notes/Db3.mp3',
                    'notes/D3.mp3',
                    'notes/Eb3.mp3',
                    'notes/E3.mp3',
                    'notes/F3.mp3',
                    'notes/Gb3.mp3',
                    'notes/G3.mp3',
                    'notes/Ab3.mp3',
                    'notes/A3.mp3',
                    'notes/Bb3.mp3',
                    'notes/B3.mp3',

                    'notes/C4.mp3', // 36
                    'notes/Db4.mp3',
                    'notes/D4.mp3',
                    'notes/Eb4.mp3',
                    'notes/E4.mp3',
                    'notes/F4.mp3',
                    'notes/Gb4.mp3',
                    'notes/G4.mp3',
                    'notes/Ab4.mp3',
                    'notes/A4.mp3',
                    'notes/Bb4.mp3',
                    'notes/B4.mp3'
                ],
                doneLoadingSamples_callback
            );
            pianoSamples.load();

            if ( state )
                T.setState( state );

            buildPads( T.sequence );
            setListeners();
            T.setSequence();
        }
    };
    
    return Piano;
});
