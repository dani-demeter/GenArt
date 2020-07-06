var w, h;
var cnv;
var onPhone = false;
var buttonSize;

var LIFETIME = 400;
var NUM_PARTICLES = 30;
var PARTICLE_R = 3;
var PARTICLE_D = 2 * PARTICLE_R;
var particles = [];
var ALPHA = 255;

var OFFSET_X = 0.5;
var OFFSET_Y = 0.5;
var OFFSET_Z = 0.1;
var OFFSET_DZ = 0;
var SCALE_NOISE = 0.001;

var symmetry = 1;
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
        fg[i].setAlpha(ALPHA);
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
    onPhone = (w / displayDensity() < 600);
    buttonSize = onPhone ? 100 : 50;
    NUM_PARTICLES = onPhone ? 20 : NUM_PARTICLES;

    setupButton('num-particles-button', 10, 10, handleNumParticlesButton);
    setupButton('bg-color-button', 10, 10 * 2 + buttonSize, handleBGButton);
    setupButton('fg-color-button', 10, 10 * 3 + buttonSize * 2, handleFGButton);
    setupButton('sym-button', 10, 10 * 4 + buttonSize * 3, handleSymButton);
    setupButton('dz-button', 10, 10 * 5 + buttonSize * 4, handleDZButton);
    setupButton('scale-button', 10, 10 * 6 + buttonSize * 5, handleScaleButton);
    setupButton('lifetime-button', 10, 10 * 7 + buttonSize * 6, handleLifetimeButton);
    setupButton('particle-width-button', 10 * 2 + buttonSize, 10, handleParticleWidthButton);
    setupButton('particle-alpha-button', 10 * 2 + buttonSize, 10 * 2 + buttonSize, handleParticleAlphaButton);

    handleCnvPress();

    noStroke();
    background(bg);

    setupAngles();

    setupParticles();
}

function setupButton(bid, posX, posY, fn) {
    var b = createButton('');
    b.class('my-button');
    b.id(bid);
    b.position(posX, posY);
    b.size(buttonSize, buttonSize);
    b.mousePressed(fn);
    buttons.push(b);
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
        this.spawn();
    }

    spawn() {
        this.x = Math.random() * w;
        this.y = Math.random() * h;
        var c = fg[getRandomInt(0, fg.length)];
        this.color = color(red(c), green(c), blue(c));
        this.color.setAlpha(ALPHA);
        if (LIFETIME != 0) {
            this.lifetime = ((Math.random() / 2) + 0.5) * LIFETIME;
            this.dr = (red(bg) - red(this.color)) / this.lifetime;
            this.dg = (green(bg) - green(this.color)) / this.lifetime;
            this.db = (blue(bg) - blue(this.color)) / this.lifetime;
            this.life = 0;
        }

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
        if (LIFETIME != 0) {
            this.decaySaturation();
        }
    }

    decaySaturation() {
        this.color.setRed(red(this.color) + this.dr);
        this.color.setGreen(green(this.color) + this.dg);
        this.color.setBlue(blue(this.color) + this.db);
        this.color.setAlpha(ALPHA);
        this.life++;
        if (this.life > this.lifetime) {
            this.spawn();
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
    for (var i = 0; i < buttons.length; i++) {
        if (showButtons) {
            buttons[i].show();
        } else {
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
    if (newColors) {
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
            max: 0.05,
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

async function handleLifetimeButton() {
    console.log("handleLifetimeButton");
    var {
        value: newLifetime
    } = await Swal.fire({
        title: 'Choose lifetime of particles (frames)',
        text: 'Choose a lifetime of 0 for immortal particles',
        input: 'range',
        inputAttributes: {
            min: 0,
            max: 1000,
            step: 5
        },
        inputValue: LIFETIME,
        showCancelButton: true,

    })
    if (newLifetime) {
        LIFETIME = parseInt(newLifetime);
        resetSim();
    }
}

async function handleParticleWidthButton() {
    console.log("handleParticleWidthButton");
    var {
        value: newWidth
    } = await Swal.fire({
        title: 'Choose particle radius',
        input: 'range',
        inputAttributes: {
            min: 1,
            max: 10,
            step: 1
        },
        inputValue: PARTICLE_R,
        showCancelButton: true,
    })
    if (newWidth) {
        PARTICLE_R = parseInt(newWidth);
        PARTICLE_D = 2 * PARTICLE_R
        resetSim();
    }
}

async function handleParticleAlphaButton(){
    console.log("handleParticleAlphaButton");
    var {
        value: newAlpha
    } = await Swal.fire({
        title: 'Choose particle transparency',
        input: 'range',
        inputAttributes: {
            min: 1,
            max: 255,
            step: 1
        },
        inputValue: ALPHA,
        showCancelButton: true,
    })
    if (newAlpha) {
        ALPHA = parseInt(newAlpha);
        resetSim();
    }
}

function resetSim() {
    background(bg);
    setupAngles();
    particles = [];
    setupParticles();
}
