@extends ( 'chart.layout.main' )

@section ( 'saveForm' )
    <div class="save-form-container">
        <span class="details-link">
            <a href="{{  Request::url() }}" id="chartLink" class="link">{{ Request::url() }}</a>
        </span>
        <form method="POST" action="{{ $chart->hash }}" id="saveForm" class="save-form">
            @include( 'chart.component.save-form' )
            <input type="text" id="title" name="title" value="{{ $chart->title }}" placeholder="Give your masterpiece a title">
            <textarea id="description" name="description" placeholder="Give it a description">{{ $chart->description }}</textarea>
            <button type="submit" id="submitChart" class="button update">Update</button>
        </form>
    </div>
@endsection

@section ( 'state' )
    <script>
        window.ChordChartState = JSON.parse( '{!! $chart->state !!}' );
    </script>
@endsection

@section( 'saveButton' )
    <button id="transportSave" class="button">Update</button>
@endsection
