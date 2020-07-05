var w, h;
var cnv;

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
var fg;
var fgc;

var inDialogue = false;

function setup() {
    setupCoolors();
    bg = coolors.richblack;
    fg = [coolors.spirodisco];
    fg[0].setAlpha(25);
    fgc = ['spirodisco'];


    w = window.innerWidth;
    h = window.innerHeight;
    cnv = createCanvas(w, h);
    cnv.position(0, 0);

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

function mousePressed() {
    if (!inDialogue) {
        handlePress();
    }
}

async function handlePress() {
    inDialogue = true;

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
        inputValue: NUM_PARTICLES
    })
    if (!newNum) {
        inDialogue = false;
        return;
    }

    var {
        value: newBgColor
    } = await Swal.fire({
        title: "Choose background color",
        input: 'radio',
        inputOptions: {
            'richblack': 'Black',
            'ghostwhite': 'White',
        },
        inputValue: (bg == coolors['richblack'] ? 'richblack' : 'ghostwhite')
    });

    if (!newBgColor) {
        inDialogue = false;
        return;
    }

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
        }
    })

    var selectedNewColor = false;
    for(var i = 0; i<newColors.length; i++){
        if(newColors[i]!=""){
            selectedNewColor = true;
            break;
        }
    }

    if (!selectedNewColor) {
        inDialogue = false;
        return;
    }

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
        inputValue: symmetry
    });

    if (!newSym) {
        inDialogue = false;
        return;
    }

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
        inputValue: OFFSET_DZ
    })
    if (!newChange) {
        inDialogue = false;
        return;
    }

    NUM_PARTICLES = newNum;

    OFFSET_DZ = parseFloat(newChange);
    bg = coolors[newBgColor];
    fgc = newColors;
    fg = [];
    for(var i = 0; i<newColors.length; i++){
        if(newColors[i]!=""){
            fg.push(coolors[newColors[i]]);
            fg[fg.length-1].setAlpha(25);
        }
    }
    background(bg);
    symmetry = parseInt(newSym);
    setupAngles();
    particles = [];
    setupParticles();
    inDialogue = false;
}
