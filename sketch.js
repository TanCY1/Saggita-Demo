let PHI,angleSlider;
const arcLength = 1000; // Fixed arc length in pixels

function setup() {
  PHI = (1 + sqrt(5)) / 2; // Golden ratio
  angleSlider = createSlider(arcLength / (windowHeight*0.65), arcLength/(windowHeight*0.2), PI, 0.1);
  angleSlider.position(10, 10);
}


// Draw double-headed arrow between two points
function drawDoubleArrow(x1, y1, x2, y2, headSize) {
  stroke(50);
  strokeWeight(2);
  line(x1, y1, x2, y2);

  let angle = atan2(y2 - y1, x2 - x1);
  drawArrowhead(x2, y2, angle, headSize);       // End
  drawArrowhead(x1, y1, angle + PI, headSize);  // Start
}

// Draw triangle arrowhead
function drawArrowhead(x, y, angle, size) {
  push();
  translate(x, y);
  rotate(angle);
  fill(50);
  noStroke();
  beginShape();
  vertex(0, 0);
  vertex(-size, size / 2);
  vertex(-size, -size / 2);
  endShape(CLOSE);
  pop();
}

function draw() {
  let W=windowWidth;
  let H= windowHeight;
  createCanvas(W,H);
  background(100);
  let angle = angleSlider.value();        // Arc angle
  let radius = arcLength / angle;         // Radius to keep arc length constant
  let startAngle = -angle / 2 + HALF_PI;
  let endAngle = angle / 2 + HALF_PI;
  let midAngle = (startAngle + endAngle) / 2;

  // Offset arc center so its midpoint stays in canvas center
  let offsetX = cos(midAngle) * radius;

  let arcCenterX = width / 2 - offsetX;
  let arcCenterY = height*0.6875 - radius; 
  // Draw the arc
  stroke(0);
  strokeWeight(10);
  strokeCap(SQUARE)
  noFill();
  arc(arcCenterX, arcCenterY, radius * 2, radius * 2, startAngle, endAngle);
  // Get arc endpoints
  let offset=radius*(PHI/100)
  let x1 = arcCenterX + cos(startAngle) * (radius - offset);
  let y1 = arcCenterY + sin(startAngle) * (radius - offset);
  let x2 = arcCenterX + cos(endAngle) * (radius - offset);
  let y2 = arcCenterY + sin(endAngle) * (radius - offset);
  // Draw double-headed arrow between arc ends
  drawDoubleArrow(x1, y1, x2, y2, 10);
  noStroke();
  let chordLength = dist(x1, y1, x2, y2);


  // Arc center marker
  fill(255, 0, 0);
  ellipse(arcCenterX, arcCenterY, 6);

  // Info
  fill(30);
  noStroke();
  textSize(14);
  text(`Angle: ${(angle * 180 / PI).toFixed(1)}°`, 10, 50);
  text(`Radius: ${radius.toFixed(1)} px`, 10, 70);
  text(`Arc Length: ${arcLength} px`, 10, 90);
  text(`Chord Length: ${chordLength.toFixed(1)} px`, 10, 110);


  let midX = (x1 + x2) / 2;
  let midY = (y1 + y2) / 2;

  // Bottom-most point of arc
  let bottomX = width / 2;
  let bottomY = height / 2+height*0.1875;

  // Draw perpendicular line
  stroke(200, 0, 0); // Perpendicular line color
  line(midX, midY, bottomX, bottomY); // From midpoint to bottom-most point
}