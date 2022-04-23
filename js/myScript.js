
// black background
var bg = new Path.Rectangle({
    point: [0, 0],
    size: [view.size.width, view.size.height],
});
bg.fillColor = '#000000';
bg.sendToBack();

// helper functions
function randnum(min, max) {
	return Math.random() * (max - min) + min;
}

// class representing an individual particle of fireworks
class Particle {

	constructor({x=randnum(view.size.width*0.2, view.size.width*0.8), y=randnum(700, view.size.height), vx=-1, vy=-7, ax=-0.0005, ay=0.035, 
		randomSpread=0.1, layers=4, particlesPerLayer=10, sparkliness=0.5,
		explodeAtFrame=150, initColor=[231, 50/100, 100/100],
		alphaChange=-0.0125, particlesAlphaChange=-0.008, trailAlphaChange=-0.04, 
		size=5, sizeChange=-0.125, minSize=0, trailSize=5, trailSizeChange=-0.125, minTrailSize=0.01, particleSize=0,
		exploded=false, isExplosive=true, spreadSize=5
		}) {

		// set object properties from parameters
		this.vx = vx, this.vy = vy, this.ax = ax, this.ay = ay; 
		this.particleSize = particleSize, this.size = size, this.minSize = minSize, this.trailSize = trailSize, this.minTrailSize = minTrailSize
		this.trailSizeChange = trailSizeChange, this.sizeChange = sizeChange, this.explodeAtFrame = explodeAtFrame, this.initColor = initColor
		this.sparkliness = sparkliness
		this.alphaChange = alphaChange, this.particlesAlphaChange = particlesAlphaChange, this.trailAlphaChange = trailAlphaChange
		this.exploded = exploded
		this.isExplosive = isExplosive
		this.spreadSize = spreadSize

		this.currentFrame = 0
		this.trail = []
		this.path = new Path.Circle(new Point(x, y), this.size)

		// if particle is not explosive (has a trail)
		if (!isExplosive) {
			this.trail.push(new Path({
				strokeColor: 'white',
				fillColor: 'blue'
			}))
		}
		else {
			this.randomSpread = randomSpread
			this.layers = layers
			this.particlesPerLayer = particlesPerLayer
		}

		this.path.fillColor = 'red'
		this.path.fillColor.hue = initColor[0]
		this.path.fillColor.saturation = initColor[1]
		this.path.fillColor.brightness = initColor[2]

	}

	// update particle's appearance/location
	update() {
		this.currentFrame++

		// update size don't let size go below min size
		this.size += this.sizeChange
		if (this.size < this.minSize) {
			this.size = this.minSize
		}

		// update positions and velocities
		this.vy += this.ay;
		this.vx += this.ax;
		this.path.position.y += this.vy;
		this.path.position.x += this.vx;

		// update particle color
		this.path.fillColor.alpha += this.alphaChange;
		this.path.fillColor.hue += 1;

		// if particle isn't an explosive and still has a trail, then
		if (!this.isExplosive && this.trail.length != 0) {
			// add trail only if particle is still visible
			if (this.path.fillColor.alpha > 0 && Math.random() < 1-this.sparkliness) {

				// create path for a trail speck
				var trailPath = new Path.Circle(new Point(this.path.position.x, this.path.position.y), this.trailSize)
				trailPath.fillColor = "red"
				trailPath.fillColor.hue = this.initColor[0]
				trailPath.fillColor.saturation = this.initColor[1]
				trailPath.fillColor.brightness = this.initColor[2]

				// push trail speck path only if trail is viewable (> minTrailSize)
				if ( this.trailSize >= this.minTrailSize) {
					this.trail.push(trailPath)
					this.trailSize += this.trailSizeChange
				}
			}
		
			// loop through every trail speck in trail list
			for (var i = 0; i < this.trail.length; i++) {

				// update color of trail speck
				this.trail[i].fillColor.alpha += this.trailAlphaChange
				this.trail[i].fillColor.hue += 4

				// if trail speck is not visible (too small or too light), then remove trail speck from trail
				if ( this.trailSize <= this.minTrailSize || this.trail[i].fillColor.alpha <= 0.1) {
					this.trail[i].remove()
					this.trail.splice(i, 1)
				}
			}
		}


		// if the particle is explosive, it is time to explode, and the particle hasn't exploded yet
		if (this.isExplosive && this.currentFrame > this.explodeAtFrame && !this.exploded) {
			this.exploded = true
			
			// loop through every layer
			for (var divide = 1; divide <= this.layers; divide++){
				// go through every angle required
				for (var angle = 0; angle < 2*Math.PI; angle += (2*Math.PI)/this.particlesPerLayer) {
					// randomize angle based on randomSpread
					angle += randnum(-this.randomSpread*Math.PI, this.randomSpread*Math.PI)

					// determine new particle's velocity
					var nvx = Math.cos(angle)*(this.spreadSize/divide) * (1+randnum(-this.randomSpread, this.randomSpread)) 
					var nvy = Math.sin(angle)*(this.spreadSize/divide) *(1+randnum(-this.randomSpread, this.randomSpread)) 

					// add new particle
					particles.push(new Particle({
						// position, velocity, etc.
						x: this.path.position.x, y: this.path.position.y, vx: nvx, vy: nvy, ax: this.ax, ay: this.ay,
						// sizes
						size: this.particleSize, trailSize: this.trailSize, minSize: this.minSize, trailSizeChange: this.trailSizeChange, minTrailSize: this.minTrailSize,
						// colors/appearance
						trailAlphaChange: this.trailAlphaChange, alphaChange: this.particlesAlphaChange, initColor: this.initColor, sparkliness: this.sparkliness,
						// type of particle
						exploded: true, isExplosive: false,
					}))
				}
			}
		}

		// if this particle has exploded, and if this particle is not visible, and if this particle has no trail
		return (this.exploded && this.path.fillColor.alpha <= 0.1 && this.trail.length == 0)
	}
}




window.setInterval(
function addFirework() {
		let diceNum = Math.round(randnum(1, 7))
		if (document.hidden) return
		// mr sparkles
		if (diceNum == 1) {
			var p = new Particle({
				initColor : [randnum(0, 360), 50/100, 100/100],
				randomSpread: 0.1,
				particlesPerLayer: 20,
				layers: 2,
				trailSizeChange: -0.1
			})
		}
		else if (diceNum == 2) {
			// big bob
			var p = new Particle({
				initColor : [randnum(0, 360), 50/100, 100/100],
				randomSpread: 0.1,
				particlesPerLayer: 20,
				layers: 4,
				trailSize: 4,
				trailSizeChange: -0.03
			})
		}
		else if (diceNum == 3) {
			// tiny tim
			var p = new Particle({
				initColor : [randnum(0, 360), 50/100, 100/100],
				randomSpread: 0.1,
				sparkliness: 0.1,
				particlesPerLayer: 10,
				layers: 2,
			})
		}
		else if (diceNum == 4 || diceNum == 5) {
			// weirdo
			var p = new Particle({
				initColor : [randnum(0, 360), 50/100, 100/100],
				randomSpread: 0.1,
				particlesPerLayer: 20,
				sparkliness: 0.1,
				layers: 2,
				particleSize: 5
			})
		}
		else if (diceNum == 6) {
			// waterfall
			var p = new Particle({
				initColor : [randnum(0, 360), 50/100, 100/100],
				ay: 0.7,
				vy: -57, 
				randomSpread: 0.1,
				particlesPerLayer: 10,
				layers: 2,
				// trailAlphaChange: 0,
				alphaChange: -0.002
			})
		}
		else if (diceNum == 7) {
			// rando
			var p = new Particle({
				initColor : [randnum(0, 360), 50/100, 100/100],
				randomSpread: 0.7,
				particlesPerLayer: 20,
				layers: 2,
				trailSize: 4,
				trailSizeChange: -0.03
			})
		}

		particles.push(p)
}
, 2100);

let particles = []
var i
var shouldDelete

var correctedText = new PointText({
    position: view.center + [0,5],
    justification: 'center',
    content: 'Happy birthday Natu boy!!',
    fillColor: 'white',
    fontFamily: 'Courier New',
    fontWeight: 'bold',
    fontSize: 50
});

view.onFrame = function(event){
	i = 0
	// loop through every particle in particles
	for (var particle of particles) {
		// update particle
		shouldDelete = particle.update()

		// delete particle if needed
		if (shouldDelete) {
			particles[i].path.remove()
			// delete particles[i]
			particles.splice(i, 1)
		}
		i++
	}
}
