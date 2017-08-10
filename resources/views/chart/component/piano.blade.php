<div id="piano" class="piano hide">
    <div id="pianoControls" class="pianoControls">
        <div class="center-container">
            <label for="pianoTranspose" class="input-container">
                <span>Transpose</span>
                <input id="pianoTranspose" class="pianoTranspose" type="range" step="1" min="0" max="11" value="0">
            </label>
            <label for="pianoAdditionalNoteLength" class="input-container">
                <span>Note Length</span>
                <input id="pianoAdditionalNoteLength" class="pianoAdditionalNoteLength" type="range" step="1" min="0" max="3" value="1">
            </label>
        </div>
    </div>
    <div id="pianoSequence" class="pianoSequence sequencer">
        <div id="pianoSequenceControls" class="pianoSequenceControls">
            <div class="center-container">
                <button id="pianoSub" class="pianoSub button">-</button>
                <button id="pianoAdd" class="pianoAdd button">+</button>
            </div>
        </div>
        <div id="pianoSequenceContainer" class="pianoSequenceContainer"></div>
    </div>
</div>
