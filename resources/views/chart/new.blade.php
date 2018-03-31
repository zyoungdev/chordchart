@extends ( 'chart.layout.main' )

@section ( 'saveForm' )
    <div class="save-form-container">
        <form method="POST" action="/" id="saveForm" class="save-form">
            @include( 'chart.component.save-form' )
            <!--
            <label for="title" class="input-label">Title</label>
            -->
            <input type="text" id="title" name="title" value="" placeholder="Give your masterpiece a title" class="input-input">
            <!--
            <label for="description" class="input-label">Description</label>
            -->
            <textarea id="description" name="description" placeholder="Give it a description" class="input-input"></textarea>
            <button type="submit" id="submitChart" class="button">Save</button>
        </form>
    </div>
@endsection

@section( 'saveButton' )
    <button id="transportSave" class="button">Save</button>
@endsection
