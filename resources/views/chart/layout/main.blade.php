<html>
<head>
    <title>Chord Progression Play-Along</title>

    <base href="/">

    @include ( 'chart.component.meta' )

    @include ( 'chart.component.css' )
</head>

<body>
    @if ( $errors->any() )
        @foreach ( $errors->all() as $error )
            @include ( 'chart.component.error' )
        @endforeach
    @endif

    @include( 'chart.component.flash' )

    <div id="main-grid" class="main-grid">
        @include ( 'chart.component.leftbar' )

        <!--
        <div id="workspace" class="workspace">
        -->
        @include ( 'chart.component.mixer' )

        @include ( 'chart.component.metronome' )

        @include ( 'chart.component.piano' )

        @include ( 'chart.component.chart' )

        @include ( 'chart.component.details' )
        <!--
        </div>
        -->
    </div>
        
    @include ( 'chart.component.notice' )

    @include ( 'chart.component.loading' )

    @include ( 'chart.component.key' )

    @include ( 'chart.component.javascript' )

    @yield ( 'state' )
</body>
</html>
