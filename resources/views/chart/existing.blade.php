@extends ( 'chart.layout.main' )

@section ( 'saveForm' )
    <div class="save-form-container">
        
        <span class="details-link">
            <h3 class="link-title">Link</h3>
            <a href="{{  Request::url() }}" id="chartLink" class="link">{{ Request::url() }}</a>
        </span>
        <form method="POST" action="/p/{{ $chart->hash }}" id="saveForm" class=".center-container">
            @include( 'chart.component.save-form' )
            <label for="title">Title</label>
            <input type="text" id="title" name="title" value="{{ $chart->title }}" placeholder="Give your masterpiece a title" required>
            <label for="description">Description</label>
            <input type="text" id="description" name="description" value="{{ $chart->description }}" placeholder="Describe this piece in any way" required>
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
