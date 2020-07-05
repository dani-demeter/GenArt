var w, h;
var cnv;
var onPhone = false;

var NUM_PARTICLES = 50;
var PARTICLE_R = 2;
var PARTICLE_D = 2 * PARTICLE_R;
var particles = [];

var OFFSET_X = 0.5;
var OFFSET_Y = 0.5;
var OFFSET_Z = 0.1;
var OFFSET_DZ = 0.0005;
var SCALE_NOISE = 0.001;

var symmetry = 3;
var Ss, Cs;

var bg;
var fg = [];
var fgc = ['spirodisco', 'mint'];

var showButtons = true;
var buttons = [];

function setup() {
    setupCoolors();
    bg = coolors.richblack;

    for (var i = 0; i < fgc.length; i++) {
        fg.push(coolors[fgc[i]]);
        fg[i].setAlpha(25);
    }
    new Noty({
        theme: 'nest',
        timeout: 5000,
        text: "Tap/click anywhere for options",
        callbacks: {
            onClick: handleCnvPress
        }
    })
    .show();


    w = window.innerWidth;
    h = window.innerHeight;
    cnv = createCanvas(w, h);
    cnv.position(0, 0);
    cnv.mousePressed(handleCnvPress);
    onPhone = (w<600);
    var s = onPhone ? 200 : 50;
    NUM_PARTICLES = onPhone ? 50 : 20;

    var numParticlesButton = createButton('');
    numParticlesButton.class('my-button');
    numParticlesButton.id('num-particles-button');
    numParticlesButton.position(10, 10);
    numParticlesButton.size(s, s);
    numParticlesButton.mousePressed(handleNumParticlesButton);
    buttons.push(numParticlesButton);

    var bgColorButton = createButton('');
    bgColorButton.class('my-button');
    bgColorButton.id('bg-color-button');
    bgColorButton.position(10, 10*2+s);
    bgColorButton.size(s, s);
    bgColorButton.mousePressed(handleBGButton);
    buttons.push(bgColorButton);

    var fgColorButton = createButton('');
    fgColorButton.class('my-button');
    fgColorButton.id('fg-color-button');
    fgColorButton.position(10, 10*3+s*2);
    fgColorButton.size(s, s);
    fgColorButton.mousePressed(handleFGButton);
    buttons.push(fgColorButton);

    var symButton = createButton('');
    symButton.class('my-button');
    symButton.id('sym-button');
    symButton.position(10, 10*4+s*3);
    symButton.size(s, s);
    symButton.mousePressed(handleSymButton);
    buttons.push(symButton);

    var dzButton = createButton('');
    dzButton.class('my-button');
    dzButton.id('dz-button');
    dzButton.position(10, 10*5+s*4);
    dzButton.size(s, s);
    dzButton.mousePressed(handleDZButton);
    buttons.push(dzButton);

    var scaleButton = createButton('');
    scaleButton.class('my-button');
    scaleButton.id('scale-button');
    scaleButton.position(10, 10*6+s*5);
    scaleButton.size(s, s);
    scaleButton.mousePressed(handleScaleButton);
    buttons.push(scaleButton);
    handleCnvPress();

    noStroke();
    background(bg);

    setupAngles();

    setupParticles();
}

function setupAngles() {
    Ss = [];
    Cs = [];
    for (var i = 0; i < symmetry; i++) {
        var angle = i * TWO_PI / symmetry;
        Ss.push(Math.sin(angle));
        Cs.push(Math.cos(angle));
    }
}

function setupParticles() {
    for (var i = 0; i < NUM_PARTICLES; i++) {
        particles.push(new Particle());
    }
}

class Particle {
    constructor() {
        this.x = Math.random() * w;
        this.y = Math.random() * h;
        this.color = fg[getRandomInt(0, fg.length)];
    }

    update() {
        var angle = noise(OFFSET_X + this.x * SCALE_NOISE, OFFSET_Y + this.y * SCALE_NOISE, OFFSET_Z) * TWO_PI;
        var v = p5.Vector.fromAngle(angle);

        this.vx = v.x;
        this.vy = v.y;

        this.x += this.vx;
        this.y += this.vy;

        if (this.x > w) {
            this.x -= w;
        } else if (this.x < 0) {
            this.x += w;
        }
        if (this.y > h) {
            this.y -= h;
        } else if (this.y < 0) {
            this.y += h;
        }
    }

    draw() {
        fill(this.color);
        var tx = this.x - w / 2;
        var ty = this.y - h / 2;
        for (var i = 0; i < symmetry; i++) {
            var nx = tx * Cs[i] - ty * Ss[i] + w / 2;
            var ny = tx * Ss[i] + ty * Cs[i] + h / 2;
            if (inRange(nx, ny)) {
                ellipse(nx - PARTICLE_R, ny - PARTICLE_R, PARTICLE_D);
            }

        }
    }
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
}

function inRange(x, y) {
    return (x > 0 && y > 0 && x < w && y < h);
}

function draw() {
    ChangeOffset();
    UpdateAndDrawParticles();
}

function ChangeOffset() {
    OFFSET_Z += OFFSET_DZ;
}

function UpdateAndDrawParticles() {
    for (var i = 0; i < NUM_PARTICLES; i++) {
        particles[i].update();
        particles[i].draw();
    }
}

async function handleCnvPress() {
    showButtons = !showButtons;
    for(var i = 0; i<buttons.length; i++){
        if(showButtons){
            buttons[i].show();
        }else{
            buttons[i].hide();
        }
    }
}

async function handleNumParticlesButton() {
    console.log("handleNumParticlesButton");
    var {
        value: newNum
    } = await Swal.fire({
        title: 'Choose number of particles',
        input: 'range',
        inputAttributes: {
            min: 1,
            max: 100,
            step: 1
        },
        inputValue: NUM_PARTICLES,
        showCancelButton: true,
    })
    if (newNum) {
        NUM_PARTICLES = parseInt(newNum);
        resetSim();
    }
}

async function handleBGButton() {
    console.log("handleBGButton");
    var {
        value: newBgColor
    } = await Swal.fire({
        title: "Choose background color",
        input: 'radio',
        inputOptions: {
            'richblack': 'Black',
            'ghostwhite': 'White',
        },
        inputValue: (bg == coolors['richblack'] ? 'richblack' : 'ghostwhite'),
        showCancelButton: true,
    });

    if (newBgColor) {
        bg = coolors[newBgColor];
        resetSim();
    }
}

async function handleFGButton() {
    console.log("handleFGButton");
    var {
        value: newColors
    } = await Swal.fire({
        title: 'Choose particle color(s)',
        html: `
            <div class="form-check">
                <input class="form-check-input" type="checkbox" value="spirodisco" id="checkbox1" ${fgc.includes('spirodisco') ? "checked" : ""}>
                <label class="form-check-label" for="checkbox1">
                    Blue
                </label>
            </div>
            <div class="form-check">
                <input class="form-check-input" type="checkbox" value="gold" id="checkbox2" ${fgc.includes('gold') ? "checked" : ""}>
                <label class="form-check-label" for="checkbox2">
                    Gold
                </label>
            </div>
            <div class="form-check">
                <input class="form-check-input" type="checkbox" value="infrared" id="checkbox3" ${fgc.includes('infrared') ? "checked" : ""}>
                <label class="form-check-label" for="checkbox3">
                    Red
                </label>
            </div>
            <div class="form-check">
                <input class="form-check-input" type="checkbox" value="mint" id="checkbox4" ${fgc.includes('mint') ? "checked" : ""}>
                <label class="form-check-label" for="checkbox4">
                    Green
                </label>
            </div>
            <div class="form-check">
                <input class="form-check-input" type="checkbox" value="ghostwhite" id="checkbox5" ${fgc.includes('ghostwhite') ? "checked" : ""}>
                <label class="form-check-label" for="checkbox5">
                    White
                </label>
            </div>
            `,
        focusConfirm: false,
        preConfirm: () => {
            return [
                document.getElementById('checkbox1').checked ? document.getElementById('checkbox1').value : "",
                document.getElementById('checkbox2').checked ? document.getElementById('checkbox2').value : "",
                document.getElementById('checkbox3').checked ? document.getElementById('checkbox3').value : "",
                document.getElementById('checkbox4').checked ? document.getElementById('checkbox4').value : "",
                document.getElementById('checkbox5').checked ? document.getElementById('checkbox5').value : ""
            ]
        },
        showCancelButton: true,
    })
    if(newColors){
        var selectedNewColor = false;
        for (var i = 0; i < newColors.length; i++) {
            if (newColors[i] != "") {
                selectedNewColor = true;
                break;
            }
        }

        if (selectedNewColor) {
            fgc = newColors;
            fg = [];
            for (var i = 0; i < newColors.length; i++) {
                if (newColors[i] != "") {
                    fg.push(coolors[newColors[i]]);
                    fg[fg.length - 1].setAlpha(25);
                }
            }
            resetSim();
        }
    }
}

async function handleSymButton() {
    console.log("handleSymButton");
    var {
        value: newSym
    } = await Swal.fire({
        title: 'Choose new symmetry',
        input: 'range',
        inputAttributes: {
            min: 1,
            max: 12,
            step: 1
        },
        inputValue: symmetry,
        showCancelButton: true,
    });

    if (newSym) {
        symmetry = parseInt(newSym);
        resetSim();
    }
}

async function handleDZButton() {
    console.log("handleDZButton");
    var {
        value: newChange
    } = await Swal.fire({
        title: 'Continuous field change',
        input: 'range',
        inputAttributes: {
            min: 0,
            max: 0.005,
            step: 0.0001
        },
        inputValue: OFFSET_DZ,
        showCancelButton: true,
    })
    if (newChange) {
        OFFSET_DZ = parseFloat(newChange);
        resetSim();
    }
}

async function handleScaleButton() {
    console.log("handleScaleButton");
    var {
        value: newScale
    } = await Swal.fire({
        title: 'Choose scale of noise',
        input: 'range',
        inputAttributes: {
            min: 0.0005,
            max: 0.1,
            step: 0.0005
        },
        inputValue: SCALE_NOISE,
        showCancelButton: true,

    })
    if (newScale) {
        SCALE_NOISE = parseFloat(newScale);
        resetSim();
    }
}

function resetSim(){
    background(bg);
    setupAngles();
    particles = [];
    setupParticles();
}
