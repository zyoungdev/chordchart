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
                    T.addViewBar( barNum );
                    resetBarNumbers(); } },
                "Delete": function( e ) { deleteSelectedBar(); },
            },
            selectedBar = false,
            altIsDown = false,
            dropLeft = false;

        /***************************************************
         *               Listeners
         ***************************************************/
            function setListeners() {
                let chart = hf.get( "chart" );

                chart.addEventListener( "mousedown", mousedown );
                chart.addEventListener( "mouseup", mouseup );
                window.addEventListener( "keydown", keydown );
                window.addEventListener( "keyup", keyup );
                document.body.addEventListener( "scroll", scroll );

                Array.prototype.forEach.call( T.bars, function( bar ) {
                    setBarListeners( bar.element );
                } );
            }

            function setBarListeners( bar ) {
                bar.addEventListener( "dragstart", dragstart, false );
                bar.addEventListener( "dragend", dragend, false );
                bar.addEventListener( "dragover", dragover, false );
            }

            let lastScroll = 0;
            let isScrolling = false;
            function scroll( e ) {
                let pos = document.body.pageYOffset || document.body.scrollTop;

                if ( pos > lastScroll )
                {
                    if ( ! isScrolling )
                    {
                        let notes = hf.get( "chordContainer" ),
                            controls = hf.get( "chartControls" ),
                            bars = hf.get( "chartWorkspace" ),
                            controlsRect = controls.getBoundingClientRect(),
                            notesRect = notes.getBoundingClientRect();

                        notes.classList.add( "chordContainerScrolling" );
                        controls.classList.add( "chartControlsScrolling" );
                        controls.style.top = notesRect.height + "px";
                        bars.style.top = ( notesRect.height + controlsRect.height ) + "px";

                        isScrolling = true;
                    }
                }
                else if ( pos === 0 )
                {
                    let notes = hf.get( "chordContainer" ),
                        controls = hf.get( "chartControls" ),
                        bars = hf.get( "chartWorkspace" ),
                        notesRect = notes.getBoundingClientRect();

                    notes.classList.remove( "chordContainerScrolling" );
                    controls.classList.remove( "chartControlsScrolling" );
                    controls.style.top = "initial";
                    bars.style.top = "initial";

                    isScrolling = false;
                }

                lastScroll = pos;
            }

        /***************************************************
         *               Helper Functions
         ***************************************************/
            function resetBarBorders() {
                for ( let i = 0; i < T.bars.length; i++ )
                {
                    T.bars[ i ].element.classList.remove( "dropSelectedLeft" );
                    T.bars[ i ].element.classList.remove( "dropSelectedRight" );
                }
            }

            function resetBarNumbers() {
                for ( let i = 0; i < T.bars.length; i++ )
                {
                    let barNum = T.bars[ i ].element.querySelector( ".number" );
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

                // Change bar number when it's not running
                if ( !gs.isRunning )
                {
                    let barNumElement = bar.querySelector( ".number" );
                    barNumber = parseInt( barNumElement.innerHTML ) - 1;
                }
            }

            function isNumber( n ) {
                return !isNaN( parseFloat( n ) ) && isFinite( n );
            }

            function getRGB()
            {
                return { r: hf.getRandomInt( 256 ), g: hf.getRandomInt( 256 ), b: hf.getRandomInt( 256 ) };
            }

        /***************************************************
         *               Drag and Drop
         ***************************************************/
            function dragstart( e ) {
                hf.log( "dragstart" );
                e.target.classList.add( "dragging" );
                e.dataTransfer.setData('text', 'DUMMYDATA');
            }

            function dragover( e ) {
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
                for ( let i = 0; i < T.bars.length; i++ )
                    T.bars[ i ].element.classList.remove( "dragging" );

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
                let i = Array.from( selectedBar.parentNode.children ).indexOf( selectedBar ),
                    model = T.bars[i],
                    view = selectedBar;

                if ( e.ctrlKey )
                    copyBuffer = {
                        model: model,
                        view: view
                    };
            }

            function cutBar( e ) {
                copyBar( e )
                deleteSelectedBar();
            }

            function pasteBar( e ) {
                if ( !e.ctrlKey )
                    return;

                let newBar = copyBuffer.view.cloneNode( true );
                newBar.classList.remove( "barSelected" );
                setBarListeners( newBar );

                // Add bar to model
                let i = Array.from( selectedBar.parentNode.children ).indexOf( selectedBar );
                T.bars.splice( i + 1, 0, { element: newBar,
                                       rhythm: copyBuffer.model.rhythm,
                                       chordName: copyBuffer.model.chordName,
                                       chordQuality: copyBuffer.model.chordQuality } );

                // Add bar to view
                selectedBar.parentNode.insertBefore(
                    newBar, selectedBar.nextSibling );

                resetBarNumbers();
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
                let chordContainer = selectedBar.querySelector( ".barChord" ),
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
                let chordContainer = selectedBar.querySelector( ".barChord" ),
                    bars = hf.getElByCN( "bar" ),
                    barNum = T.getSelectedBarNumber(),
                    index = Array.prototype.indexOf.call( bars, selectedBar );

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
                T.bars.splice( index, 0, { element: barElement, rhythm: [], chordName: "", chordQuality: "", repeat: {} } );
            }

            function addViewBar( index ) {
                let workspace = hf.get( "chartWorkspace" ),
                    newBar = document.createElement( "div" );

                // Build DOM Element
                newBar.classList.add( "bar" );
                newBar.innerHTML =
                    "<div class=\"barContainer\">" +
                        // "<div class=\"rhythmNumber\">R1</div>" +
                        "<div class=\"barChord\"></div>" +
                        "<div class=\"barFooter\">" +
                            "<div class=\"repeatContainer\">" +
                                "<div class=\"barPlug\"></div>" +
                                "<div class=\"barRepeat\"></div>" +
                            "</div>" +
                            "<div class=\"number\"></div>" +
                        " </div>" +
                    "</div>";
                newBar.setAttribute( "draggable", true );

                // Add bar to view
                workspace.insertBefore( newBar, workspace.children[ index ] );
                setBarSelection( newBar );

                setBarListeners( newBar );

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
                T.bars[ barNum ] = { element: T.bars[ barNum ].element, rhythm: [], chordName: "", chordQuality: "", repeat: {} };
            }

            function clearViewBar() {
                let chordContainer = selectedBar.querySelector( ".barChord" );

                // Clear view
                chordContainer.innerHTML = "";
            }

        /***************************************************
         *               Save / Restore
         ***************************************************/
            function initDefaultScore() {
                T.bars = [
                    { element: {}, rhythm: T.defaultSequence, chordName: "C", chordQuality: "\u25B39", repeat: {} },
                    { element: {}, rhythm: T.defaultSequence, chordName: "D", chordQuality: "-9", repeat: {} },
                    { element: {}, rhythm: T.defaultSequence, chordName: "E", chordQuality: "-7b9", repeat: {} },
                    { element: {}, rhythm: T.defaultSequence, chordName: "F", chordQuality: "\u25B39", repeat: {} },
                    { element: {}, rhythm: T.defaultSequence, chordName: "G", chordQuality: "9", repeat: {} },
                    { element: {}, rhythm: T.defaultSequence, chordName: "A", chordQuality: "-9", repeat: {} },
                    { element: {}, rhythm: T.defaultSequence, chordName: "B", chordQuality: "\u00D8", repeat: {} },
                    { element: {}, rhythm: T.defaultSequence, chordName: "C", chordQuality: "\u25B3", repeat: {} }
                ]
            }

            function buildChart( chart ) {
                hf.log( "Building Chart" );
                for ( let i = 0; i < chart.length; i++ )
                {
                    // Add bar to view
                    let barElement = addViewBar( i );

                    // Set DOM Element in model
                    chart[ i ].element = barElement;

                    // Set chord and quality in view
                    setViewChord( chart[ i ].chordName );
                    setViewQuality( chart[ i ].chordQuality );
                    setRepeat( chart, i );
                }

                resetBarNumbers();
            }

        /***************************************************
         *                Repeat Plugs
         ***************************************************/
            function clearPlugs( firstBar, secondBar )
            {
                // Reset connected plug
                secondBar.plug.style.background = "#323232";
                secondBar.repeat.innerHTML = "";
                secondBar.model.repeat = {};

                // Reset clicked plug
                firstBar.plug.style.background = "#323232";
                firstBar.repeat.innerHTML = "";
                firstBar.model.repeat = {};
            }

            let randomRGB = getRGB();
            function setPlug( currentBar, currentPlugSelection, e )
            {
                let htmlBars = currentBar.parentNode.children,
                    viewBars = Array.from( htmlBars ),
                    i = viewBars.indexOf( currentBar ),
                    modelBar = T.bars[ i ],
                    viewPlug = currentBar.querySelector( ".barPlug" ),
                    viewRepeat = currentBar.querySelector( ".barRepeat" );

                // Current Bar has a repeat, delete the repeat
                if ( Object.keys( modelBar.repeat ).length !== 0 )
                {
                    let modelOtherBar = T.bars[ modelBar.repeat.to ],
                        viewOtherBar = htmlBars[ modelBar.repeat.to ],
                        viewOtherPlug = viewOtherBar.querySelector( ".barPlug" ),
                        viewOtherRepeat = viewOtherBar.querySelector( ".barRepeat" );

                    clearPlugs(
                        {
                            bar: currentBar,
                            model: modelBar,
                            plug: viewPlug,
                            repeat: viewRepeat
                        },
                        {
                            bar: viewOtherBar,
                            model: modelOtherBar,
                            plug: viewOtherPlug,
                            repeat: viewOtherRepeat
                        }
                    );
                    return;
                }

                // First Plug clicked
                if ( ! firstPlugSelection )
                {
                    // Always use bright colors
                    let colorFloor = 100;
                    while ( randomRGB.r < colorFloor && randomRGB.g < colorFloor && randomRGB.b < colorFloor )
                        randomRGB = getRGB();

                    currentPlugSelection.style.background = "rgb( " +
                        randomRGB.r + ", " +
                        randomRGB.g + ", " +
                        randomRGB.b + ")";

                    firstPlugSelection = {
                        plug: currentPlugSelection,
                        bar: currentBar,
                        index: i
                    };
                }
                // Second plug clicked
                else
                {
                    let isNum = false,
                        num = false;

                    // Get user input
                    while ( ! isNum )
                    {
                        num = prompt( "Number of times this passage should play: " );

                        if ( isNumber( num ) && num > 0 )
                            isNum = true;
                        else
                            continue;

                        num = parseInt( num ) - 1;
                    }

                    let barModel = T.bars[ i ];
                    
                    // Connect plugs in correct order
                    if ( i < firstPlugSelection.index )
                    {
                        // Set first repeat plug
                        barModel.repeat = {
                            to: firstPlugSelection.index,
                        };

                        // Set second repeat plug
                        T.bars[ firstPlugSelection.index ].repeat = {
                            to: i,
                            num: num,
                            remaining: num
                        };

                        firstPlugSelection.bar
                            .querySelector( ".barRepeat" )
                            .innerHTML = num;
                    }
                    else
                    {
                        // Set first repeat plug
                        T.bars[ firstPlugSelection.index ].repeat = {
                            to: i,
                        };

                        // Set second repeat plug
                        barModel.repeat = {
                            to: firstPlugSelection.index,
                            num: num,
                            remaining: num
                        };

                        viewRepeat.innerHTML = num;
                    }

                    currentPlugSelection.style.background = "rgb( " +
                        randomRGB.r + ", " +
                        randomRGB.g + ", " +
                        randomRGB.b + ")";

                    randomRGB = getRGB();
                    firstPlugSelection = false;
                }
            }

            function setRepeat( chart, index )
            {
                let bar = chart[ index ];
                if ( 'repeat' in bar && Object.keys( bar.repeat ).length !== 0 )
                {
                    let repeat = bar.element.querySelector( ".barRepeat" ),
                        plug = bar.element.querySelector( ".barPlug" ),
                        otherBar = chart[ bar.repeat.to ],
                        otherPlug = otherBar.element.querySelector( ".barPlug" );


                    randomRGB = getRGB();
                    plug.style.background = "rgb( " +
                        randomRGB.r + ", " +
                        randomRGB.g + ", " +
                        randomRGB.b + ")";

                    otherPlug.style.background = "rgb( " +
                        randomRGB.r + ", " +
                        randomRGB.g + ", " +
                        randomRGB.b + ")";
                    repeat.innerHTML = bar.repeat.num;
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

            let firstPlugSelection = false;

            function mousedown( e ) {
                if ( e.which === 1 )
                {
                    if ( hf.isInsideCN( e.target, "bar" ) )
                    {
                        let bar = hf.returnTarget( e.target, "bar" ),
                            barNum = bar.querySelector( ".number" );

                        if ( e.target.classList.contains( "barPlug" ) )
                        {
                            setPlug( bar, e.target, e );
                            return;
                        }

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
                }
            }

            function mouseup( e ) {
            }

    Chart.prototype = {
        addBar: function( index ) {
            let barElement = addViewBar( index );
            addModelBar( index, barElement );
            resetBarNumbers();
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

            let barNumElement = selectedBar.querySelector( ".number" ),
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
            return T.bars[ barNumber ].element;
        },

        barTick: function() {
            T.getBarInfo();

            if ( Object.keys( bar.repeat ).length !== 0 && 'remaining' in currentBar.repeat &&
                  currentBar.repeat.remaining > 0 )
            {
                currentBar.repeat.remaining--;
                barNumber = currentBar.repeat.to;
                currentBar
                    .element
                    .querySelector( ".barRepeat" )
                    .innerHTML = currentBar.repeat.remaining;
            }
            else
                barNumber++;

            if ( barNumber >= T.bars.length )
            {
                barNumber = 0;
                T.resetRepeats();
            }
        },

        resetDraw: function() {
            drawIndex = 0;
            drawTimes = [];
        },

        resetRepeats: function()
        {
            for ( let i = 0; i < T.bars.length; i++ )
            {
                let bar = T.bars[ i ];
                let repeat = bar.element.querySelector( ".barRepeat" );

                if ( Object.keys( bar.repeat ).length !== 0 &&
                     bar.repeat.num )
                {
                    repeat.innerHTML = bar.repeat.num;
                    bar.repeat.remaining = bar.repeat.num;
                }
            }
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
                    Array.prototype.forEach.call( T.bars, function( bar ) {
                        bar.element.classList.remove( "barPlaying" );
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
