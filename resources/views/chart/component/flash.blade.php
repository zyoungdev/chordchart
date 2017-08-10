@if ( session( 'flash' ) )
    <div class="flash">
        {{ session('flash') }}
    </div>
@endif
