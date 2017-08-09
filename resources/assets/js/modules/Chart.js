define([  "HelperFunctions", "GlobalState" ], function( hf, gs ) {
    "use strict";

    let T = {},
        instance = null;

    function Chart() {
        T = this;
        this.bars = [];
        this.defaultSequence = [ 1,1,1,1 ];
    }

    /***************************************************
     *
     *                  Private
     *
     ***************************************************/
        let elementOver = null,
            barNumber = 0,
            currentBar = {},
            copyBuffer = null,
            isEditingBar = false,
            drawTimes = [],
            drawIndex = 0,
            keysDown = {},
            keyDownMap = {
                "c": function( e ) { if ( e.ctrlKey ) { copyBar( e ); } },
                "x": function( e ) { if ( e.ctrlKey ) { cutBar( e ); } },
                "v": function( e ) { if ( e.ctrlKey ) { pasteBar( e ); } },
                "b": function( e ) { if ( e.ctrlKey ) {
                    let barNum = T.getSelectedBarNumber() + 1;
                    T.addModelBar( barNum );
                    T.addViewBar( barNum ); } },
                "Delete": function( e ) { deleteSelectedBar(); },
            },
            selectedBar = false,
            altIsDown = false,
            dropLeft = false;

        /***************************************************
         *               Listeners
         ***************************************************/
            function setListeners() {
                let chart = hf.get( "chart" ),
                    bars = hf.getElByCN( "bar" );

                chart.addEventListener( "mousedown", mousedown );
                chart.addEventListener( "mouseup", mouseup );
                window.addEventListener( "keydown", keydown );
                window.addEventListener( "keyup", keyup );


                Array.prototype.forEach.call( bars, function( bar ) {
                    setBarListeners( bar );
                } );
            }

            function setBarListeners( bar ) {
                bar.addEventListener( "dragstart", dragstart, false );
                bar.addEventListener( "dragend", dragend, false );
                bar.addEventListener( "dragover", dragover, false );
            }

        /***************************************************
         *               Helper Functions
         ***************************************************/
            function resetBarBorders() {
                let bars = hf.getElByCN( "bar" );

                for ( let i = 0; i < bars.length; i++ )
                {
                    bars[ i ].classList.remove( "dropSelectedLeft" );
                    bars[ i ].classList.remove( "dropSelectedRight" );
                }
            }

            function resetBarNumbers() {
                let bars = hf.getElByCN( "bar" );

                for ( let i = 0; i < bars.length; i++ )
                {
                    let barNum = bars[ i ].getElementsByClassName( "barNumber" )[0];
                    barNum.innerHTML = i + 1;
                }
            }

            function setBarSelection( bar ) {
                // Remove selection from bar
                if ( selectedBar )
                    selectedBar.classList.remove( "barSelected" );

                // If clicking a selected bar, we are done
                if ( selectedBar === bar )
                {
                    selectedBar = null;
                    return;
                }

                // Get the selected bar
                selectedBar = bar;

                // Make it selected
                bar.classList.add( "barSelected" );

                if ( !gs.isRunning )
                {
                    let barNumElement = bar.getElementsByClassName( "barNumber" )[ 0 ];
                    barNumber = parseInt( barNumElement.innerHTML ) - 1;
                }
            }

        /***************************************************
         *               Drag and Drop
         ***************************************************/
            function dragstart( e ) {
                hf.log( "dragstart" );
                e.target.classList.add( "dragging" );
            }

            function dragover( e ) {
                let bars = hf.getElByCN( "bar" );

                elementOver = hf.returnTarget( e.target, "bar" );
                altIsDown = e.altKey;

                resetBarBorders();

                let elOverPos = elementOver.getBoundingClientRect(),
                    elOverMid = elOverPos.left + ( ( elOverPos.right - elOverPos.left ) / 2 );

                // elementOver.classList.add( "dropSelected" );
                if ( e.pageX <= elOverMid )
                {
                    elementOver.classList.remove( "dropSelectedRight" );
                    elementOver.classList.add( "dropSelectedLeft" );
                    dropLeft = true;
                }
                else
                {
                    elementOver.classList.remove( "dropSelectedLeft" );
                    elementOver.classList.add( "dropSelectedRight" );
                    dropLeft = false;
                }
            }

            function dragend( e ) {
                let bars = hf.getElByCN( "bar" ),
                    draggedBarElement = e.target,
                    overBarElement = hf.returnTarget( elementOver, "bar" );

                // Remove all selections
                resetBarBorders();

                // Done dragging, remove dragging CSS
                draggedBarElement.classList.remove( "dragging" );

                // Don't do anything if dropped on same element
                if ( draggedBarElement === overBarElement )
                    return;

                let draggedIndex = Array.prototype.indexOf.call( bars, draggedBarElement ),
                    barModel = T.bars.splice( draggedIndex, 1 )[ 0 ],
                    droppedBarElement = draggedBarElement,
                    droppedBarIndex = null;

                // If alt key is down, we are copying
                if ( altIsDown )
                {
                    // Create copy of DOM Element
                    droppedBarElement = draggedBarElement.cloneNode( true );

                    // Set Listeners
                    setBarListeners( droppedBarElement );

                    // Undelete dragged bar in model
                    T.bars.splice( draggedIndex, 0, barModel );

                    // Copy bar in model
                    barModel = JSON.parse( JSON.stringify( barModel ) );

                    // Set copied DOM Element in model
                    barModel.element = droppedBarElement;
                }

                // Set bar in view
                if ( dropLeft )
                    overBarElement.parentNode.insertBefore( droppedBarElement, overBarElement );
                else
                    overBarElement.parentNode.insertBefore( droppedBarElement, overBarElement.nextSibling );

                // Get index of dropped bar in DOM
                droppedBarIndex = Array.prototype.indexOf.call( bars, droppedBarElement );

                // Add the bar to the model
                T.bars.splice( droppedBarIndex, 0, barModel );

                resetBarNumbers();

                // Reset selection then select correct bar
                setBarSelection( bars[ 0 ] );
                if ( dropLeft )
                    setBarSelection( overBarElement.previousSibling );
                else
                    setBarSelection( overBarElement.nextSibling );
            }

        /***************************************************
         *           Cut, Copy, Delete, Paste
         ***************************************************/
            function copyBar( e ) {
                if ( e.ctrlKey )
                    copyBuffer = selectedBar;
            }

            function cutBar( e ) {
                copyBar( e )
                deleteSelectedBar();
            }

            function pasteBar( e ) {
                if ( !e.ctrlKey )
                    return;

                let newBar = copyBuffer.cloneNode( true );
                setBarListeners( newBar );

                selectedBar.parentNode.insertBefore(
                    newBar, selectedBar.nextSibling );
            }

            function deleteSelectedBar() {
                let barNum = T.getSelectedBarNumber();
                T.removeBar( barNum );
            }

        /***************************************************
         *          Set Rhythm / Chord / Quality
         ***************************************************/
            function setModelRhythm( rhythm ) {
                let barNum = T.getSelectedBarNumber();

                // Set rhythm in model
                T.bars[ barNum ].rhythm = rhythm;
            }

            function setViewRhythm( rhythm ) { }

            function setModelChord( chordName ) {
                let barNum = T.getSelectedBarNumber();

                // Set chord name in model
                T.bars[ barNum ].chordName = chordName;
            }

            function setViewChord( chordName ) {
                let chordContainer = selectedBar.getElementsByClassName( "barChord" )[0],
                    barNum = T.getSelectedBarNumber();

                // Set chord name in view
                chordContainer.innerHTML = chordName + " ";
            }

            function setModelQuality( chordQuality ) {
                let barNum = T.getSelectedBarNumber();

                // Set chord quality in model
                T.bars[ barNum ].chordQuality = chordQuality;
            }

            function setViewQuality( chordQuality ) {
                let chordContainer = selectedBar.getElementsByClassName( "barChord" )[0],
                    bars = hf.getElByCN( "bar" ),
                    barNum = T.getSelectedBarNumber(),
                    index = Array.prototype.indexOf.call( bars, selectedBar );

                // Set chord quality in model
                // T.bars[ barNum ].chordQuality = chordQuality;

                // Set chord quality in view
                chordContainer.innerHTML += chordQuality;

                // If rhythm hasn't been set, use default
                // if ( T.bars[ barNum ].rhythm.length === 0 )
                    // T.bars[ barNum ].rhythm = T.defaultSequence;

                // Move selection to next bar
                index++;
                if ( index >= bars.length )
                    index = 0;

                setBarSelection( bars[ index ] );
            }

        /***************************************************
         *          Add / Remove / Clear
         ***************************************************/
            function addModelBar( index, barElement ) {
                // Add new bar to model
                T.bars.splice( index, 0, { element: barElement, rhythm: [], chordName: "", chordQuality: "" } );
            }

            function addViewBar( index ) {
                let workspace = hf.get( "chartWorkspace" ),
                    newBar = document.createElement( "div" ),
                    bars = hf.getElByCN( "bar" );


                // Build DOM Element
                newBar.classList.add( "bar" );
                newBar.innerHTML =
                    "<div class=\"barContainer\">" +
                        "<div class=\"rhythmNumber\">R1</div>" +
                        "<div class=\"barChord\"></div>" +
                        "<div class=\"barNumber\"></div>" +
                    "</div>";
                newBar.setAttribute( "draggable", true );

                // Add bar to view
                workspace.insertBefore( newBar, workspace.children[ index ] );
                setBarSelection( newBar );

                setBarListeners( newBar );
                resetBarNumbers();

                return workspace.children[ index ];
            }

            function removeModelBar( index ) {
                // Remove bar from model
                T.bars.splice( index + 1, 1 );
            }

            function removeViewBar( index ) {
                let workspace = hf.get( "chartWorkspace" );

                if ( index < 0 )
                    index = 0;

                // Remove bar from view
                workspace.removeChild( selectedBar );
                if ( workspace.children[ index ] )
                    setBarSelection( workspace.children[ index ] );

                resetBarNumbers();
            }

            function clearModelBar() {
                let barNum = T.getSelectedBarNumber();

                // Clear model
                T.bars[ barNum ] = { element: T.bars[ barNum ].element, rhythm: [], chordName: "", chordQuality: "" };
            }

            function clearViewBar() {
                let chordContainer = selectedBar.getElementsByClassName( "barChord" )[0];

                // Clear view
                chordContainer.innerHTML = "";
            }

        /***************************************************
         *               Save / Restore
         ***************************************************/
            function initDefaultScore() {
                T.bars = [
                    { element: {}, rhythm: T.defaultSequence, chordName: "C", chordQuality: "\u25B39" },
                    { element: {}, rhythm: T.defaultSequence, chordName: "D", chordQuality: "-9" },
                    { element: {}, rhythm: T.defaultSequence, chordName: "E", chordQuality: "-7b9" },
                    { element: {}, rhythm: T.defaultSequence, chordName: "F", chordQuality: "\u25B39" },
                    { element: {}, rhythm: T.defaultSequence, chordName: "G", chordQuality: "9" },
                    { element: {}, rhythm: T.defaultSequence, chordName: "A", chordQuality: "-9" },
                    { element: {}, rhythm: T.defaultSequence, chordName: "B", chordQuality: "\u00D8" },
                    { element: {}, rhythm: T.defaultSequence, chordName: "C", chordQuality: "\u25B3" }
                ]
            }

            function buildChart( chart ) {
                hf.log( "Building Chart" );
                for ( let i = 0; i < chart.length; i++ )
                {
                    // Add bar to view
                    let barElement = addViewBar( i );

                    // Set DOM Element in model
                    T.bars[ i ].element = barElement;

                    // Set chord and quality in view
                    setViewChord( chart[ i ].chordName );
                    setViewQuality( chart[ i ].chordQuality );
                }
            }

        /***************************************************
         *                   Events
         ***************************************************/
            function keydown( e ) {
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

                keysDown[ e.key ] = false;
            }

            function mousedown( e ) {
                if ( e.which === 1 )
                {
                    if ( hf.isInsideCN( e.target, "bar" ) )
                    {
                        let bar = hf.returnTarget( e.target, "bar" ),
                            barNum = bar.getElementsByClassName( "barNumber" )[0];

                        if ( !isEditingBar )
                            setBarSelection( bar );
                    }
                    else if ( e.target.classList.contains( "note" ) )
                    {
                        if ( !selectedBar )
                            return;

                        let notes = hf.get( "notes" ),
                            qualities = hf.get( "noteQualities" );

                        T.setChord( e.target.innerHTML );
                        qualities.classList.remove( "hide" );
                        notes.classList.add( "hide" );

                        isEditingBar = true;
                    }
                    else if ( e.target.classList.contains( "quality" ) )
                    {
                        let notes = hf.get( "notes" ),
                            qualities = hf.get( "noteQualities" );

                        T.setQuality( e.target.innerHTML );
                        notes.classList.remove( "hide" );
                        qualities.classList.add( "hide" );

                        isEditingBar = false;
                    }
                    else if ( e.target.id === "subBar" )
                    {
                        if ( !selectedBar || isEditingBar )
                            return;

                        let bars = hf.getElByCN( "bar" );
                        let index = Array.prototype.indexOf.call( bars, selectedBar );

                        T.removeBar( --index );
                    }
                    else if ( e.target.id === "addBar" )
                    {
                        let workspace = hf.get( "chartWorkspace" );
                        if ( workspace.innerHTML === "" )
                        {
                            T.addBar( 0 );
                            return;
                        }

                        if ( !selectedBar || isEditingBar )
                            return;

                        let bars = hf.getElByCN( "bar" );
                        let index = Array.prototype.indexOf.call( bars, selectedBar );

                        T.addBar( ++index );
                    }
                    else if ( e.target.id === "clearBar" )
                    {
                        if ( !selectedBar )
                            return;

                        T.clearBar();
                    }
                    else if ( e.target.id === "clearScore" )
                    {
                        if ( isEditingBar )
                            return;

                        // Clear model
                        T.bars = [];

                        let workspace = hf.get( "chartWorkspace" );
                        workspace.innerHTML = "";
                        selectedBar = false;
                    }
                    else if ( e.target.classList.contains( "pianoNavButton" ) )
                    {
                        let button = e.target,
                            buttonText = e.target.innerHTML;

                        if ( buttonText === "Piano Notes" )
                        {
                            let chords = hf.get( "chordContainer" );

                            if ( chords.classList.contains( "hide" ) )
                            {
                                chords.classList.remove( "hide" );
                                button.classList.add( "activeButton" );
                            }
                            else
                            {
                                chords.classList.add( "hide" );
                                button.classList.remove( "activeButton" );
                            }
                        }
                        else if ( buttonText === "Chord Chart Controls" )
                        {
                            let chartcontrols = hf.get( "chartControls" );

                            if ( chartcontrols.classList.contains( "hide" ) )
                            {
                                chartcontrols.classList.remove( "hide" );
                                button.classList.add( "activeButton" );
                            }
                            else
                            {
                                chartcontrols.classList.add( "hide" );
                                button.classList.remove( "activeButton" );
                            }
                        }
                        else if ( buttonText === "Chord Chart" )
                        {
                            let chordchart = hf.get( "chartWorkspace" );

                            if ( chordchart.classList.contains( "hide" ) )
                            {
                                chordchart.classList.remove( "hide" );
                                button.classList.add( "activeButton" );
                            }
                            else
                            {
                                chordchart.classList.add( "hide" );
                                button.classList.remove( "activeButton" );
                            }
                        }
                    }
                }
            }

            function mouseup( e ) {
            }

    Chart.prototype = {
        addBar: function( index ) {
            let barElement = addViewBar( index );
            addModelBar( index, barElement );
        },

        removeBar: function( index ) {
            removeModelBar( index );
            removeViewBar( index );
        },

        clearBar: function( index ) {
            clearModelBar( index );
            clearViewBar( index );
        },

        setRhythm: function( rhythm ) {
            setModelRhythm( rhythm );
            setViewRhythm( rhythm );
        },

        setChord: function( chordName ) {
            setModelChord( chordName );
            setViewChord( chordName );
        },

        setQuality: function( chordQuality ) {
            setModelQuality( chordQuality );
            setViewQuality( chordQuality );
        },

        getBarInfo: function() {
            currentBar = T.bars[ barNumber ];
        },

        getSelectedBarNumber: function() {
            if ( !selectedBar )
                return 0;

            let barNumElement = selectedBar.getElementsByClassName( "barNumber" )[ 0 ],
                barNum = parseInt( barNumElement.innerHTML );

            return barNum - 1;
        },

        getCurrentBar: function() {
            return currentBar;
        },

        setBarNumber: function( num ) {
            barNumber = num;
        },

        getBar: function() {
            let bars = hf.getElByCN( "bar" );
            return bars[ barNumber ];
        },

        barTick: function() {
            T.getBarInfo();

            let bars = hf.getElByCN( "bar" );
            barNumber++;
            if ( barNumber >= bars.length )
                barNumber = 0;
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
                // Light up bar
                if (drawIndex === 0)
                {
                    let bars = hf.getElByCN( "bar" );

                    Array.prototype.forEach.call(bars, function( el ) {
                        el.classList.remove( "barPlaying" );
                    });

                    currentBar.element.classList.add( "barPlaying" );
                }

                // Move to next pad
                drawIndex++;
            }
        },

        setState: function( state ) {
            T.bars = state.bars;
            T.defaultSequence = state.defaultSequence;
        },

        init: function( state ) {
            hf.log("Chart init");

            initDefaultScore();

            if ( state )
                T.setState( state );

            buildChart( T.bars );
            setListeners();
        }
    };

    function getInstance() {
        if ( instance === null )
            instance = new Chart();

        return instance;
    }
    
    return getInstance();
});
