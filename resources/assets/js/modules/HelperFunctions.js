define([ "GlobalState" ], function( gs ) {
    "use strict";

    let T = {},
        instance = null;

    function HelperFunctions(){
        T = this;
    }

    HelperFunctions.prototype = {
        $: function( idOrClass, el = document, getFirst = false ) {
            if ( idOrClass[ 0 ] === "." )
                if ( getFirst )
                    return el.getElementsByClassName( idOrClass.substr( 1 ) )[ 0 ];
                else
                    return el.getElementsByClassName( idOrClass.substr( 1 ) );
            if ( idOrClass[ 0 ] === "#" )
                return el.getElementById( idOrClass.substr( 1 ) );

            return undefined;
        },
        clamp: function( val, min, max ) {
            return (val < min) ? min : (val > max) ? max : val;
        },
        getElByCN: function(cn) {
            return document.getElementsByClassName(cn);
        },
        get: function( id ) {
            return document.getElementById( id );
        },
        isInside: function(node, target) {
            for(; node != null; node = node.parentNode)
                if (node == target)
                    return true;
        },
        isInsideCN: function(node, cn) {
            for(; node != null; node = node.parentNode)
                if ( node.classList && node.classList.contains( cn ) ) return true;
        },
        returnTarget: function(node, target) {
            for(; node != null; node = node.parentNode)
                if ( node.classList && node.classList.contains( target ) ) return node;
        },
        hasCN: function(e,cl) {
            return e.className == cl;
        },
        hasTN: function(e,tag) {
            return e.tagName == tag;
        },
        getIndex: function(items, it) {
            return Array.prototype.indexOf.call(items, it);
        },
        createElement: function(el, attr) {
            var node = document.createElement(el);
            if (attr)
            {
                for (var a in attr)
                {
                    if (attr.hasOwnProperty(a))
                    {
                        node.setAttribute(a, attr[a]);
                    }
                }
            }
            if (arguments[2])
                node.innerHTML = arguments[2];
            return node;
        },
        ajax: function(type, fd, uri, callback) {
            var
            xhr = new XMLHttpRequest();

            xhr.onload = function()
            {
                callback(this.response);
            }
            xhr.open(type, uri, true);
            if (fd) xhr.send(fd);
            else xhr.send();
        },
        toast: function( message ) {
            let div = document.createElement( "div" );
            div.classList.add( "toast" );
            div.id = "toast";
            div.innerHTML = message;
            document.body.appendChild( div );

            setTimeout(function() {
                document.body.removeChild( T.$( "#toast" ) );
            }, 3000);
        },
        getRandomInt: function( max ) {
          return Math.floor(Math.random() * Math.floor(max));
        },
        getBox: function( el ) {
            return el.getBoundingClientRect();
        },
        log: function(message) {
            if ( gs.debug )
            {
                let args = Array.from( arguments );
                args.unshift( "[CHORDPROG]" );
                console.log.apply(null, args);
            }
        }
    };

    function getInstance() {
        if ( instance === null )
            instance = new HelperFunctions();

        return instance;
    }

    return getInstance();
});
