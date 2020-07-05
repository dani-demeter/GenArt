var w, h;
var cnv;

var NUM_PARTICLES = 50;
var PARTICLE_R = 2;
var PARTICLE_D = 2*PARTICLE_R;
var particles = [];

var OFFSET_X = 0.5;
var OFFSET_Y = 0.5;
var OFFSET_Z = 0.1;
var OFFSET_DZ = 0.0001;
var SCALE_NOISE = 0.001;

var symmetry = 6;
var Ss = [];
var Cs = [];

var bg;
var fg;

function setup(){
    setupCoolors();
    bg = coolors.ghostwhite;
    fg = coolors.mint;
    fg.setAlpha(25);
    w = window.innerWidth;
    h = window.innerHeight;
    cnv = createCanvas(w, h);
    background(bg);
    cnv.position(0, 0);

    for(var i = 0; i<symmetry; i++){
        var angle = i * TWO_PI / symmetry;
        Ss.push(Math.sin(angle));
        Cs.push(Math.cos(angle));
    }

    setupParticles();
}

function setupParticles(){
    for(var i = 0; i<NUM_PARTICLES; i++){
        particles.push(new Particle());
    }
}

class Particle{
    constructor(){
        this.x = Math.random() * w;
        this.y = Math.random() * h;
    }

    update(){
        var angle = noise(OFFSET_X + this.x * SCALE_NOISE, OFFSET_Y + this.y * SCALE_NOISE, OFFSET_Z) * TWO_PI;
        var v = p5.Vector.fromAngle(angle);

        this.vx = v.x;
        this.vy = v.y;

        this.x += this.vx;
        this.y += this.vy;

        if(this.x > w){
            this.x -= w;
        }else if(this.x < 0){
            this.x += w;
        }
        if(this.y > h){
            this.y -= h;
        }else if(this.y < 0){
            this.y += h;
        }
    }

    draw(){
        var tx = this.x - w/2;
        var ty = this.y - h/2;
        for(var i = 0; i<symmetry; i++){
            var nx = tx * Cs[i] - ty * Ss[i] + w/2;
            var ny = tx * Ss[i] + ty * Cs[i] + h/2;
            if(inRange(nx, ny)){
                ellipse(nx-PARTICLE_R, ny-PARTICLE_R, PARTICLE_D);
            }

        }
    }
}

function inRange(x, y){
    return (x>0 && y>0 && x<w && y<h);
}

function draw(){
    // ChangeOffset();
    UpdateAndDrawParticles();
}

function ChangeOffset(){
    OFFSET_Z += OFFSET_DZ;
}

function UpdateAndDrawParticles(){
    noStroke();
    fill(fg);
    for(var i = 0; i<NUM_PARTICLES; i++){
        particles[i].update();
        particles[i].draw();
    }
}
