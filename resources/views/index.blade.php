<html>
<head>
    <title>Chord Progression Play-Along</title>

    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="profile" href="http://gmpg.org/xfn/11">

    <meta name="description" content="This is a chord progression creator that uses Web Audio API piano key samples to create a sequence of chords dynamically. Use it to practice your improvisation or just jam along with it." />
    <meta name="keywords" content="musician, original music, guitarist, indie music, rocktronica, dub, Zachary Young" />

    <link rel="stylesheet" href="/css/main.css">
</head>

<body>
<div id="navigation" class="navigation">
    <div class="center-container">
        <button class="navButton button">Mixer</button>
        <button class="navButton button">Metronome</button>
        <button class="navButton button">Piano</button>
        <button class="navButton button activeButton">Chart</button>
    </div>
</div>
<div id="transport" class="transport">
    <div class="center-container">
        <button id="play" class="button">Play</button>
        <label class="input-container">
            <span>Tempo</span>
            <input id="tempo" class="num-input tempo" type="number" min="1" max="600" value="120">
        </label>
        <button id="save" class="button">Save</button>
    </div>
</div>

<div id="workspace" class="workspace">
    <div id="mixer" class="hide">
        <div class="mixer-container">
            <label class="mixer-input-container">
                <span><h2>Metronome</h2></span>
                <input id="metronomeVolume" class="metronomeVolume vertical-slider" type="range" step="1" min="0" max="10" value="10" orient="vertical">
            </label>
            <label class="mixer-input-container">
                <span><h2>Piano</h2></span>
                <input id="pianoVolume" class="pianoVolume vertical-slider" type="range" step="1" min="0" max="20" value="10" orient="vertical">
            </label>
            <label class="mixer-input-container">
                <span><h2>Master</h2></span>
                <input id="masterVolume" class="masterVolume vertical-slider" type="range" step="1" min="0" max="10" value="10" orient="vertical">
            </label>
        </div>
    </div>
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
        <div id="metronomeSequence" class="metronomeSequence">
            <div>
                <div class="metronomePad"></div>
                <div class="metronomePad"></div>
                <div class="metronomePad"></div>
                <div class="metronomePad"></div>
            </div>
        </div>
    </div>
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
            <div id="pianoSequenceContainer" class="pianoSequenceContainer">
                <div>
                    <div class="pianoPad pad"></div>
                    <div class="pianoPad pad"></div>
                    <div class="pianoPad pad"></div>
                    <div class="pianoPad pad"></div>
                </div>
            </div>
        </div>
    </div>
    <div id="chart" class="chart">
        <div id="chordContainer" class="chordContainer">
            <div id="notes" class="notes">
                <div class="note">C</div>
                <div class="note">F</div>
                <div class="note" id="Bb">Bb</div>
                <div class="note" id="Eb">Eb</div>
                <div class="note" id="Ab">Ab</div>
                <div class="note" id="Db">Db</div>
                <div class="note" id="Gb">Gb</div>
                <div class="note">B</div>
                <div class="note">E</div>
                <div class="note">A</div>
                <div class="note">D</div>
                <div class="note">G</div>
            </div>
            <div id="noteQualities" class="noteQualities hide">
                <div>
                    <div class="quality">&#9651;</div>
                    <div class="quality">&#9651;9</div>
                    <div class="quality">7</div>
                    <div class="quality">9</div>
                    <div class="quality">-7</div>
                    <div class="quality">+7</div>
                    <div class="quality">&#216;</div>
                    <div class="quality">O</div>
                    <div class="quality">-&#9651;</div>
                </div>
                <div>
                    <div class="quality">&#9651;#5</div>
                    <div class="quality">7#11</div>
                    <div class="quality">7#9</div>
                    <div class="quality">7#5#9</div>
                    <div class="quality">7b9</div>
                    <div class="quality">-9</div>
                    <div class="quality">-7b9</div>
                    <div class="quality">Maj</div>
                    <div class="quality">Min</div>
                </div>
            </div>
        </div>
        <div id="chartControls" class="chartControls">
            <div class="center-container">
                <button id="subBar" class="subBar button">Remove Bar</button>
                <button id="addBar" class="addBar button">Add Bar</button>
                <button id="clearBar" class="clearBar button">Clear Bar</button>
                <button id="clearScore" class="clearScore button">Clear Score</button>
            </div>
        </div>
        <div id="chartWorkspace" class="chartWorkspace"></div>
    </div>
</div>
	
<div class="notice">Please <a href="mailto:zy@zydev.space">email me</a> with any questions or comments. Add one of these tags to the Subject line of your email: [Bug], [Feature Request], [Question], [Comment]</div>
<div id="loading" class="loading">
    <div>Loading Samples...</div>
</div>
<div id="key" class="key hide">
    <table width="100%" height="100%">
        <tr>
            <td>
                <h2>
                    Intro Theory
                </h2>
            </td>
        </tr>
        <tr>
            <td>
                Chords are built from scales and the chord qualities listed are shorthand for a particular scale. You wouldn't write Eb Lydian Dominant above a measure because it takes too long to read. This is how chord symbols came in to being. They were spawned from the necessity for fast recognition and universal understanding of scales.
            </td>
        </tr>
        <tr>
            <td>
                <h2>
                    Symbol chart
                </h2>
            </td>
        </tr>
        <tr>
            <td>
                &#9651; - Ionian or Lydian
            </td>
        </tr>
        <tr>
            <td>
                7 - Mixolydian
            </td>
        </tr>
        <tr>
            <td>
                -7 - Dorian
            </td>
        </tr>
        <tr>
            <td>
                +7 - Wholetone
            </td>
        </tr>
        <tr>
            <td>
                Ø - Locrian #2
            </td>
        </tr>
        <tr>
            <td>
                O - Whole/Half diminished
            </td>
        </tr>
        <tr>
            <td>
                -&#9651; - Melodic Minor(minor-major)
            </td>
        </tr>
        <tr>
            <td>
                &#9651;#5 - Lydian augmented
            </td>
        </tr>
        <tr>
            <td>
                7#11 or 7b5 - Lydian dominant
            </td>
        </tr>
        <tr>
            <td>
                alt - altered scale
            </td>
        </tr>
        <tr>
            <td>
                7b9 - Half/Whole diminished
            </td>
        </tr>
    </table>
</div>
<script src="/GA.js"></script>
<script src="js/main.js"></script>
</body>
</html>
