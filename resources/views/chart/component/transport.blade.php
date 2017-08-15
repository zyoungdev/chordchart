<div id="transport" class="transport">
    <div class="center-container">
        <button id="play" class="button">Play</button>
        <label class="input-container">
            <span>Tempo</span>
            <input id="tempo" class="num-input tempo" type="number" min="1" max="600" value="120">
        </label>
        @yield( 'saveButton' )
    </div>
</div>
