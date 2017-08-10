@extends ( 'chart.layout.main' )

@section ( 'saveForm' )
    <form method="POST" action="/p/{{ $chart->hash }}" id="saveForm">
        {{ csrf_field() }}
        <input name="hash" type="hidden">
        <input name="state" type="hidden">
        <button type="submit" id="save" class="button">Save</button>
    </form>
@endsection

@section ( 'state' )
    <script>
        window.ChordChartState = JSON.parse( '{!! $chart->state !!}' );
    </script>
@endsection
