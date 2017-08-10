<div id="metronome" class="metronome hide">
    <div id="metronomeControls" class="metronomeControls">
        <div class="center-container">
            <button id="metronomeSub" class="metronomeSub button">-</button>
            <button id="metronomeAdd" class="metronomeAdd button">+</button>
            <label class="input-container">
                <span>Note</span>
                <select id="metronomeRoot" class="metronome-input">
                    <option value="0">C</option>
                    <option value="1">Db</option>
                    <option value="2">D</option>
                    <option value="3">Eb</option>
                    <option value="4">E</option>
                    <option value="5">F</option>
                    <option value="6">Gb</option>
                    <option value="7">G</option>
                    <option value="8">Ab</option>
                    <option value="9">A</option>
                    <option value="10">Bb</option>
                    <option value="11">B</option>
                </select>
            </label>
            <label class="input-container">
                <span>Wave Type</span>
                <select id="metronomeType" class="metronome-input">
                    <option value="sine">Sine</option>
                    <option value="square">Square</option>
                    <option value="sawtooth">Sawtooth</option>
                    <option value="triangle">Triangle</option>
                </select>
                </select>
            </label>
            <label class="input-container">
                <span>Length</span>
                <select id="metronomeClickLength" class="metronome-input">
                    <option value="0.0001">Short</option>
                    <option value="0.001">Medium</option>
                    <option value="0.01">Long</option>
                </select>
                </select>
            </label>
        </div>
    </div>
    <div id="metronomeSequence" class="metronomeSequence"></div>
</div>
