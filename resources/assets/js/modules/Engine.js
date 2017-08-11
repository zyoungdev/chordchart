define([ "HelperFunctions", "GlobalState", "AudioContext", "MasterChannel", "Instruments", "Chart" ], function( hf, gs, ac, Master, Instruments, Chart ) {
    "use strict";

    let T = {};

    function Engine(){
        T = this;
        this.tempo = 120;
    }

    /***************************************************
     *
     *                  Private
     *
     ***************************************************/
        let nextSequenceTime = 0.0,
            playButton = {},
            selectedButton = false,
            selectedBarNum = 0,
            oneBar = 0,
            quarter = 0,
            eighth = 0,
            sixteenth = 0;

        function createHash( length ) {
            // Pool does not contain I, O, l, o, 0
            let pool = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz123456789",
                output = "",
                min = 0,
                max = pool.length - 1;

            if ( !length )
                length = 32;

            for ( let i = length; i > 0; i-- )
                output += pool[ Math.floor( Math.random() * ( max - min + 1 ) + min ) ];

            return output;
        }

        function currentTime() {
            return ac.currentTime;
        }

        function setupAnimationFrame() {
            window.requestAnimFrame = (function(){
                return  window.requestAnimationFrame ||
                window.webkitRequestAnimationFrame ||
                window.mozRequestAnimationFrame ||
                window.oRequestAnimationFrame ||
                window.msRequestAnimationFrame ||
                function( callback ){
                    window.setTimeout(callback, 1000 / 60);
                };
            })();
        }

        function setListeners() {
            window.addEventListener("blur", function() {
                T.stop();
            });

            window.addEventListener("keydown", function(e) {
                if (e.type === "keydown")
                    if (e.code === "Space")
                    {
                        if ( gs.isRunning )
                            T.stop();
                        else
                            T.play();
                    }
            });

            window.addEventListener("mousedown", function( e ) {
                mousedown( e );
            });

            window.addEventListener("mouseup", function( e ) {
                mouseup( e );
            });

            hf.get( "tempo" ).addEventListener("change", function( e ) {
                let tempo = parseInt( e.target.value );
                T.setTempo( tempo );
            });

            document.addEventListener("contextmenu", function( e ) {
                e.preventDefault();
                return false;
            });

            hf.get( "saveForm" ).addEventListener("submit", function( e ) {
                e.preventDefault();
                T.setFormData( e );
                e.target.submit();
            });

        }

        function setInstruments() {
            Instruments = [ new Metronome(), new Piano() ];
        }

        function setTimings() {
            quarter = 60.0 / T.tempo;
            oneBar = quarter * 4;
            eighth = quarter / 2;
            sixteenth = quarter / 4;

            hf.log("\n\t1 bar: " + oneBar +
                "\n\t1/16: " + sixteenth +
                "\n\t1/8:  " + eighth +
                "\n\t1/4:  " + quarter
            );
        }

        function setupSequence( Instruments ) {
            let now = currentTime();

            if ( now >= nextSequenceTime )
            {
                let barStart = now + gs.lookAhead,
                    performanceNow = window.performance.now();

                // Set next play time first to mitigate delay from scheduling
                setNextSequenceTime();

                // Get information from bar
                Chart.barTick();

                // For each instrument
                for ( let i = 0; i < Instruments.length; i++ )
                {
                    let noteLength = oneBar,
                        instr = Instruments[ i ],
                        len = instr.sequence.length;

                    noteLength = oneBar / ( len || 1 );
                    instr.resetDraw();
                    Chart.resetDraw();

                    // Clear Queued Notes
                    instr.clear();

                    // schedule a note for each sequence index 
                    for ( let j = 0; j < len; j++ )
                    {
                        let noteStart = barStart + noteLength * j,
                            noteStop = noteStart + noteLength * 0.999;

                        // Set draw time for each sequence index
                        instr.getDrawTimes()[ j ] =
                            performanceNow + noteLength * j * 1000;

                        Chart.getDrawTimes()[ j ] =
                            performanceNow + noteLength * j * 1000;

                        // If flag is set at sequence index
                        if ( instr.sequence[ j ] )
                            instr.createNote( noteLength, noteStart, noteStop, j );
                    }
                }
            }
        }

        function setNextSequenceTime() {
            nextSequenceTime += oneBar;
        }

        function setBarNumber( num ) {
            Chart.setBarNumber( num );
            selectedBarNum = num;
        }

        function buildEnvironment() {
            setupAnimationFrame();
            T.setTempo( 120 );
            document.getElementById("loading").style.display = 'none';
            playButton = hf.get( "play" );
            selectedButton = hf.get( "navigation" ).getElementsByClassName( "activeButton" )[0];

            if ( gs.isRunning )
                T.play();
        }

        function reqFrame() {
            setupSequence( Instruments );

            Chart.draw();
            for (let i = 0; i < Instruments.length; i++)
                Instruments[ i ].draw();

            if ( gs.isRunning )
                requestAnimFrame( reqFrame );
        }

        function mousedown( e ) {
            if ( e.target.id === "play" )
            {
                if ( gs.isRunning )
                    T.stop();
                else
                    T.play();
            }
            else if ( e.target.classList.contains( "navButton" ) )
            {
                let navButtons = hf.getElByCN( "navButton" ),
                    button = e.target,
                    buttonText = e.target.innerHTML.toLowerCase();

                // Remove highlight from button
                if ( selectedButton )
                    selectedButton.classList.remove( "activeButton" );

                // Change selected nav button
                selectedButton = button;
                button.classList.add( "activeButton" );

                // Hide all pages
                for ( let i = 0; i < navButtons.length; i++ )
                {
                    let pageName = navButtons[ i ].innerHTML.toLowerCase(),
                        page = document.getElementById( pageName );

                    if ( page )
                        page.classList.add( "hide" );
                }

                document.getElementById( buttonText ).classList.remove( "hide" );
            }
        }

        function mouseup( e ) {
            if ( e.target.id === "metronomeVolume" )
            {
                Instruments[ 0 ].setVolume( parseInt( e.target.value ) / 10 );
            }
            else if ( e.target.id === "pianoVolume" )
            {
                Instruments[ 1 ].setVolume( parseInt( e.target.value ) / 10 );
            }
            else if ( e.target.id === "masterVolume" )
            {
                Master.setVolume( parseInt( e.target.value ) / 10 );
            }
        }

    Engine.prototype = {
        setTempo: function( tempo ) {
            hf.log( "Tempo: " + tempo );
            T.tempo = tempo;

            setTimings();
        },

        play: function() {
            hf.log("Play");

            setBarNumber( Chart.getSelectedBarNumber() );

            /*
             * If gs.lookAhead is set too high, drawing won't be synchronized
             *     The draw times will be overridden before they have a chance to draw
             */
            gs.lookAhead = ( gs.lookAhead > oneBar ) ? gs.maxLookAhead : gs.lookAhead;

            // Update time because clock never stops
            nextSequenceTime = currentTime();
            gs.isRunning = true;

            // Set play button to red, set text to Stop
            playButton.style.backgroundColor = "rgba( 150,50,50,1 )";
            playButton.innerHTML = "Stop";

            requestAnimFrame( reqFrame );
        },

        stop: function() {
            hf.log("Stop");

            gs.isRunning = false;

            // Set play button to Green, set text to Play
            playButton.style.backgroundColor = "rgba( 50,150,50,1 )";
            playButton.innerHTML = "Play";

            T.NotesAllOff();
        },

        NotesAllOff: function() {
            let now = currentTime();

            for ( let i = 0; i < Instruments.length; i++ )
                Instruments[ i ].stop( now );
        },

        setFormData: function( e ) {
            let state = {
                globalState: gs,
                engine: T,
                chart: Chart,
                instruments: Instruments
            };

            let form = e.target,
                hash = createHash( 8 );

            form.elements.hash.value = hash;
            form.elements.state.value = JSON.stringify( state );
        },

        setState: function( state ) {
            if ( !state )
                return;

            T.tempo = state.tempo;

            let tempo = hf.get( "tempo" );
            tempo.value = T.tempo;
        },

        init: function( state ) {
            hf.log("Init");

            if ( !state ){
                state = {
                    globalState: null,
                    engine: null,
                    chart: null,
                    instruments: [null, null]
                };
            }

            gs.setState( state.globalState );
            T.setState( state.engine );

            Chart.init( state.chart );
            Master.init();
            for (let i = 0; i < Instruments.length; i++)
                Instruments[ i ].init( state.instruments[ i ], buildEnvironment );

            setListeners();
        }
    };

    return Engine;
});
