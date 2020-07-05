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

var inDialogue = false;

function setup() {
    setupCoolors();
    bg = coolors.richblack;
    fg = coolors.spirodisco;
    fg.setAlpha(25);
    w = window.innerWidth;
    h = window.innerHeight;
    cnv = createCanvas(w, h);
    background(bg);
    cnv.position(0, 0);

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

function inRange(x, y) {
    return (x > 0 && y > 0 && x < w && y < h);
}

function draw() {
    ChangeOffset();
    UpdateAndDrawParticles();
}

function ChangeOffset() {
    OFFSET_Z += OFFSET_DZ;
    console.log(OFFSET_Z);
}

function UpdateAndDrawParticles() {
    noStroke();
    fill(fg);
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
        value: newBgColor
    } = await Swal.fire({
        title: "Choose background color color",
        input: 'radio',
        inputOptions: {
            'richblack': 'Black',
            'ghostwhite': 'White',
        },
    });

    if (!newBgColor) {
        inDialogue = false;
        return;
    }

    var {
        value: newColor
    } = await Swal.fire({
        title: "Choose particle color",
        input: 'radio',
        inputOptions: {
            'spirodisco': 'Blue',
            'gold': 'Gold',
            'infrared': 'Red',
            'mint': 'Green',
            'ghostwhite': 'White'
        },
    });

    if (!newColor) {
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
            step: 0.0005
        },
        inputValue: 0.0005
    })
    if(!newChange){
        inDialogue = false;
        return;
    }
    OFFSET_DZ = parseInt(newChange);
    bg = coolors[newBgColor];
    fg = coolors[newColor];
    fg.setAlpha(25);
    background(bg);
    symmetry = parseInt(newSym);
    setupAngles();
    particles = [];
    setupParticles();
    inDialogue = false;
}
