@extends ( 'chart.layout.main' )

@section ( 'saveForm' )
    <div class="save-form-container">
        <form method="POST" action="/p/{{ $chart->hash }}" id="saveForm" class=".center-container">
            @include( 'chart.component.save-form' )
            <label for="title">Title</label>
            <input type="text" id="title" name="title" value="{{ $chart->title }}" required>
            <label for="description">Description</label>
            <input type="text" id="description" name="description" value="{{ $chart->description }}" required>
            <button type="submit" id="submitChart" class="button update">Update</button>
        </form>
    </div>
@endsection

@section ( 'state' )
    <script>
        window.ChordChartState = JSON.parse( '{!! $chart->state !!}' );
    </script>
@endsection
