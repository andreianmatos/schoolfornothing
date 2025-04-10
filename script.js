let walkers = [];
let redEnvelopeClosed; // Variable to hold the closed red envelope image
let redEnvelopeOpen;   // Variable to hold the open red envelope image
let isOpen = false; // Flag to determine which envelope to display
let isEnvelopeClickable = true; // Flag to handle whether the envelope is clickable or not

function preload() {
  // Load the red envelope images
  redEnvelopeClosed = loadImage('data/imgs/red_envelope_closed.png');
  redEnvelopeOpen = loadImage('data/imgs/red_envelope_open.png');
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  noFill();
  strokeCap(ROUND); // Rounded stroke ends for a smoother appearance

  // Create multiple walkers with unique noise offsets, but start with them disabled
  for (let i = 0; i < 5; i++) {
    walkers.push(new Walker(random(1000)));
  }
}

function draw() {
  let envelopeImage;

    // If the envelope is open, draw the walkers' paths
  if (isOpen) {
    for (let walker of walkers) {
      walker.move();
      walker.display();
    }
  }

  // Select the correct envelope image based on the isOpen flag
  if (isOpen) {
    envelopeImage = redEnvelopeOpen; // Show the open envelope
  } else {
    envelopeImage = redEnvelopeClosed; // Show the closed envelope
  }

  // Calculate the scaling factor to fit the image proportionally within the canvas
  let imgWidth = envelopeImage.width;
  let imgHeight = envelopeImage.height;

  let scaleFactor = min(width, height) * 0.5 / max(imgWidth, imgHeight); // 50% of the screen size
  imgWidth = imgWidth * scaleFactor;
  imgHeight = imgHeight * scaleFactor;

  // Draw the envelope image at the center of the screen
  imageMode(CENTER); // Draw image from the center
  image(envelopeImage, width / 2, height / 1.8, imgWidth * 2, imgHeight * 2);
  
  // Show the cursor as a pointer when it is over the envelope and it's clickable
  if (isEnvelopeClickable && mouseOverEnvelope(imgWidth, imgHeight)) {
    cursor(HAND);  // Change cursor to a hand when mouse is over the envelope
  } else {
    cursor(ARROW); // Default cursor
  }
}

// Detect if the mouse is over the envelope and toggle the isOpen flag
function mousePressed() {
  // Only toggle the envelope when it is clickable
  if (isEnvelopeClickable && mouseOverEnvelope()) {
    clear();
    isOpen = true; // Open the envelope
    isEnvelopeClickable = false; // Disable the envelope clicking after it's clicked
  }
}

// Helper function to check if mouse is over the envelope
function mouseOverEnvelope() {
  // Calculate the position and size of the image
  let envelopeImage = isOpen ? redEnvelopeOpen : redEnvelopeClosed;
  let imgWidth = envelopeImage.width;
  let imgHeight = envelopeImage.height;

  let scaleFactor = min(width, height) * 0.5 / max(imgWidth, imgHeight); // 50% of the screen size
  imgWidth = imgWidth * scaleFactor;
  imgHeight = imgHeight * scaleFactor;

  // Calculate the bounds of the image
  let x1 = width / 2 - imgWidth / 2;
  let y1 = height / 2 - imgHeight / 2;
  let x2 = width / 2 + imgWidth / 2;
  let y2 = height / 2 + imgHeight / 2;

  // Check if the mouse is inside the bounds of the image
  return (mouseX >= x1 && mouseX <= x2 && mouseY >= y1 && mouseY <= y2);
}

class Walker {
  constructor(noiseOffset) {
    this.pos = createVector(random(width), random(height));
    this.prevPos = this.pos.copy();
    this.noiseOffset = noiseOffset;

    // Increase variability in step size to make the movement slower
    this.stepSize = random(2, 5); // Larger step size for longer movements (instead of random(0.1, 1))
    this.maxStrokeWeight = 15; // Increased maximum stroke weight for thicker lines
    this.noiseFactor = random(1000); // Unique noise factor for each walker
    this.speed = random(0.5, 2); // Slower speed for larger steps (instead of random(0.2, 8))
    this.directionNoiseOffset = random(500); // Noise offset for direction for erratic behavior

    // Parameters for dashed lines
    this.dashLength = random(10, 30); // Length of the dash
    this.gapLength = random(10, 30);  // Length of the gap between dashes
    this.dashCounter = 0; // Keeps track of how much space has been drawn

    // Randomly decide if this walker should use dashed lines
    this.isDashed = random() > 0.5; // 50% chance for dashed lines
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
    if (this.isDashed) {
      // If dashed line, decide whether to draw a dash or a gap
      if (this.dashCounter < this.dashLength) {
        line(this.prevPos.x, this.prevPos.y, this.pos.x, this.pos.y);
      }
    } else {
      // If not dashed, draw a solid line
      line(this.prevPos.x, this.prevPos.y, this.pos.x, this.pos.y);
    }
  }
}
