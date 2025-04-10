let walkers = [];

function setup() {
  createCanvas(windowWidth, windowHeight);
  background(255); // White background
  noFill();
  strokeCap(ROUND); // Rounded stroke ends for a smoother appearance

  // Create multiple walkers with unique noise offsets
  for (let i = 0; i < 5; i++) {
    walkers.push(new Walker(random(1000)));
  }
}

function draw() {
  for (let walker of walkers) {
    walker.move();
    walker.display();
  }
}

class Walker {
  constructor(noiseOffset) {
    this.pos = createVector(random(width), random(height));
    this.prevPos = this.pos.copy();
    this.noiseOffset = noiseOffset;
    
    // Increase variability in step size to make the movement slower
    this.stepSize = random(0.1, 1); // Step size variation
    this.maxStrokeWeight = 15; // Increased maximum stroke weight for thicker lines
    this.noiseFactor = random(1000); // Unique noise factor for each walker
    this.speed = random(0.2, 8); // Varying speed to make movement slower
    this.directionNoiseOffset = random(500); // Noise offset for direction for erratic behavior
    
    // Parameters for dashed lines
    this.dashLength = random(10, 30); // Length of the dash
    this.gapLength = random(10, 30);  // Length of the gap between dashes
    this.dashCounter = 0; // Keeps track of how much space has been drawn
  }

  move() {
    this.prevPos.set(this.pos);

    // Use Perlin noise to determine the angle of movement for more erratic paths
    let angle = noise(this.noiseOffset) * TWO_PI * 2 + noise(this.directionNoiseOffset) * TWO_PI;
    this.noiseOffset += 0.003; // Slow noise progression
    this.directionNoiseOffset += 0.05; // Change the movement direction more frequently

    // Use varying step size for each walker
    this.pos.x += cos(angle) * this.stepSize * this.speed;
    this.pos.y += sin(angle) * this.stepSize * this.speed;

    // Check if walker is out of bounds and reverse direction if so
    if (this.pos.x < 0 || this.pos.x > width) {
      this.pos.x = constrain(this.pos.x, 0, width);
      this.stepSize *= -1; // Reverse direction to avoid horizontal straight lines
    }

    if (this.pos.y < 0 || this.pos.y > height) {
      this.pos.y = constrain(this.pos.y, 0, height);
      this.stepSize *= -1; // Reverse direction to avoid vertical straight lines
    }
  }

  display() {
    // Calculate stroke weight based on the distance moved
    let distance = dist(this.prevPos.x, this.prevPos.y, this.pos.x, this.pos.y);
    
    // Varying stroke weight based on the distance, with randomness added for more erratic appearance
    let sw = map(distance, 0, this.stepSize * 15, 1, this.maxStrokeWeight);
    sw += map(noise(this.noiseFactor), 0, 1, -5, 5); // Add erratic random variation to the stroke weight

    // Decide whether to draw a dash or a gap based on dash counter
    this.dashCounter += distance;

    if (this.dashCounter > this.dashLength + this.gapLength) {
      this.dashCounter = 0; // Reset dash counter to start a new dash-gap cycle
    }

    // Apply dynamic stroke weight and random stroke color for a natural, organic look
    stroke(0, 150); // Semi-transparent black stroke
    strokeWeight(sw); // Apply dynamic stroke weight

    // Draw dashed line if within dash length range, otherwise skip
    if (this.dashCounter < this.dashLength) {
      line(this.prevPos.x, this.prevPos.y, this.pos.x, this.pos.y);
    }
  }
}
