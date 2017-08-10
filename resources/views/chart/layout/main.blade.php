<html>
<head>
    <title>Chord Progression Play-Along</title>

    <base href="/">

    @include ( 'chart.component.meta' )

    @include ( 'chart.component.css' )
</head>

<body>
    @include( 'chart.component.flash' )

    @include ( 'chart.component.navigation' )

    @include ( 'chart.component.transport' )

    <div id="workspace" class="workspace">
        @include ( 'chart.component.mixer' )

        @include ( 'chart.component.metronome' )

        @include ( 'chart.component.piano' )
        
        @include ( 'chart.component.chart' )
    </div>
        
    @include ( 'chart.component.notice' )

    @include ( 'chart.component.loading' )

    @include ( 'chart.component.key' )

    @include ( 'chart.component.javascript' )

    @yield ( 'state' )
</body>
</html>
