@extends ( 'chart.layout.main' )

@section ( 'saveForm' )
    <div class="save-form-container">
        <form method="POST" action="/" id="saveForm" class=".center-container">
            @include( 'chart.component.save-form' )
            <label for="title" class="input-label">Title</label>
            <input type="text" id="title" name="title" value="" placeholder="Give your masterpiece a title" class="input-input">
            <label for="description" class="input-label">Description</label>
            <input type="text" id="description" name="description" value="" placeholder="Describe this piece in any way" class="input-input">
            <button type="submit" id="submitChart" class="button">Save</button>
        </form>
    </div>
@endsection
