let angleSlider, arcDiagram;
const arcLength = 1000; // Fixed arc length in pixels
const PHI = (1 + Math.sqrt(5)) / 2; // Golden ratio

function setup() {
  createCanvas(windowWidth, windowHeight);

  angleSlider = createSlider(
    arcLength / (windowHeight * 0.65),
    arcLength / (windowHeight * 0.2),
    PI,
    0.1
  );
  angleSlider.position(10, 10);

  arcDiagram = new ArcDiagram(arcLength);
}

function draw() {
  background(100);
  arcDiagram.update(angleSlider.value());
  arcDiagram.display();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  arcDiagram.resize();
}

// ------------------------------
// ArcDiagram Class
// ------------------------------
class ArcDiagram {
  constructor(arcLength) {
    this.arcLength = arcLength;
    this.updateDimensions();
  }

  update(angle) {
    this.angle = angle;
    this.radius = this.arcLength / angle;

    this.startAngle = -angle / 2 + HALF_PI;
    this.endAngle = angle / 2 + HALF_PI;
    this.midAngle = (this.startAngle + this.endAngle) / 2;

    this.offsetX = cos(this.midAngle) * this.radius;

    this.arcCenter = {
      x: width / 2 - this.offsetX,
      y: height * 0.6875 - this.radius,
    };

    this.offset = this.radius * (PHI / 100);
    this.p1 = this._getPointOnArc(this.startAngle);
    this.p2 = this._getPointOnArc(this.endAngle);

    this.midpoint = this._getMidpoint(this.p1, this.p2);
    this.bottomPoint = {
      x: width / 2,
      y: height / 2 + height * 0.1875,
    };

    this.chordLength = dist(this.p1.x, this.p1.y, this.p2.x, this.p2.y);
  }

  resize() {
    this.update(this.angle);
  }

  display() {
    this._drawArc();
    this._drawChord();
    this._drawPerpendicularLine();
    this._drawCenterMarker();
    this._drawLabels();
    this._drawRadius();
    this._drawArcCenterToMidpoint();
  }

  _getPointOnArc(angle) {
    return {
      x: this.arcCenter.x + cos(angle) * (this.radius - this.offset),
      y: this.arcCenter.y + sin(angle) * (this.radius - this.offset),
    };
  }

  _getMidpoint(p1, p2) {
    return {
      x: (p1.x + p2.x) / 2,
      y: (p1.y + p2.y) / 2,
    };
  }

  _drawArc() {
    stroke(0);
    strokeWeight(10);
    strokeCap(SQUARE);
    noFill();
    arc(
      this.arcCenter.x,
      this.arcCenter.y,
      this.radius * 2,
      this.radius * 2,
      this.startAngle,
      this.endAngle
    );
  }

  _drawChord() {
    stroke(50);
    strokeWeight(2);
    line(this.p1.x, this.p1.y, this.p2.x, this.p2.y);

    const angle = atan2(this.p2.y - this.p1.y, this.p2.x - this.p1.x);
    this._drawArrowhead(this.p2.x, this.p2.y, angle, 10, color(50));
    this._drawArrowhead(this.p1.x, this.p1.y, angle + PI, 10, color(50));

    // Label
    fill(0);
    noStroke();
    textSize(16);
    textAlign(CENTER, BOTTOM);
    text("l = " + str(round((this.p1.x - this.p2.x) / 100, 2)), this.midpoint.x+width/50, this.midpoint.y - 15);
  }

  _drawArrowhead(x, y, angle, size, lineColor) {
    push();
    translate(x, y);
    rotate(angle);
    fill(lineColor); // Use passed color
    noStroke();
    beginShape();
    vertex(0, 0);
    vertex(-size, size / 2);
    vertex(-size, -size / 2);
    endShape(CLOSE);
    pop();
  }

  // New generic double arrow function
  _drawDoubleArrow(x1, y1, x2, y2, size, lineColor) {
    stroke(lineColor);
    strokeWeight(2);
    line(x1, y1, x2, y2);

    let angle = atan2(y2 - y1, x2 - x1);
    this._drawArrowhead(x2, y2, angle, size, lineColor);  // End
    this._drawArrowhead(x1, y1, angle + PI, size, lineColor);  // Start
  }

  _drawPerpendicularLine() {
    this.midChord = createVector((this.p1.x + this.p2.x) / 2, (this.p1.y + this.p2.y) / 2);
    this.bottom = createVector(width / 2, height / 2 + height * 0.1875); // bottom point of the arc

    let lineColor = color(200, 0, 0); // Define the color for the line (same as before)

    // Calculate angle between midChord and bottom
    let angle = atan2(this.bottom.y - this.midChord.y, this.bottom.x - this.midChord.x);
    this._drawDoubleArrow(this.midChord.x, this.midChord.y, this.bottom.x, this.bottom.y, 10, lineColor);

    // Midpoint of the line
    let midX = (this.midChord.x + this.bottom.x) / 2;
    let midY = (this.midChord.y + this.bottom.y) / 2;

    // Calculate direction vector
    let dx = this.bottom.x - this.midChord.x;
    let dy = this.bottom.y - this.midChord.y;

    // Normalize direction vector
    let mag = sqrt(dx * dx + dy * dy);
    let offset = -12; // Label offset

    // Perpendicular to the line (to the right)
    let perpX = -dy / mag * offset;
    let perpY = dx / mag * offset;

    push();
    translate(midX + perpX, midY + perpY); // Offset to the right
    rotate(angle - HALF_PI); // Rotate 90 degrees to make the label perpendicular
    fill(lineColor); // Use the same color as the line
    noStroke();
    textAlign(LEFT, CENTER);
    textSize(14);
    text("s = " + round(dist(this.midChord.x, this.midChord.y, this.bottom.x, this.bottom.y) / 100, 1), 0, 0);
    pop();
  }

  _drawArcCenterToMidpoint() {
    // Draw the arrow from the arc center to the midpoint of the chord
    this._drawDoubleArrow(this.arcCenter.x - width / 200, this.arcCenter.y, this.midpoint.x - width / 200, this.midpoint.y, 10, color(0, 255, 100));

    // Calculate midpoint of the line from the center to the chord midpoint
    let midX = (this.arcCenter.x + this.midpoint.x) / 2;
    let midY = (this.arcCenter.y + this.midpoint.y) / 2;

    // Calculate angle for the line from arc center to midpoint
    let angle = atan2(this.midpoint.y - this.arcCenter.y, this.midpoint.x - this.arcCenter.x);

    // Perpendicular offset to place label on the left
    let offset = 12; // Label offset
    let dx = this.midpoint.x - this.arcCenter.x;
    let dy = this.midpoint.y - this.arcCenter.y;
    let mag = sqrt(dx * dx + dy * dy);

    // Use sagitta logic for perpendicular direction
    let perpX = -dy / mag; // Perpendicular X direction (left)
    let perpY = dx / mag; // Perpendicular Y direction (left)

    // Midpoint between arc center and midpoint for label placement
    let labelX = midX + perpX;
    let labelY = midY + perpY;

    // Ensure the label is always on the left side
    if (dx > 0) {
        // If the line goes rightward (positive x direction), reverse the perpendicular offset
        labelX = midX - perpX;
        labelY = midY - perpY;
    }

    // Draw label, always on the left
    push();
    translate(labelX, labelY);
    textAlign(CENTER, CENTER);
    noStroke();
    fill(0, 255, 100);
    textSize(14);
    text("s - r = " + round(dist(this.arcCenter.x, this.arcCenter.y, this.midpoint.x, this.midpoint.y) / 100, 1), -width/37, 0);
    pop();
}


  _drawCenterMarker() {
    fill(255, 255, 0);
    noStroke();
    ellipse(this.arcCenter.x, this.arcCenter.y, 10);
  }

  _drawLabels() {
    fill(30);
    noStroke();
    textSize(14);
    textAlign(LEFT);
    text(`Angle: ${(this.angle * 180 / PI).toFixed(0)}°`, 10, 50);
    //text(`Radius: ${this.radius.toFixed(1)} px`, 10, 70);
    //text(`Arc Length: ${this.arcLength} px`, 10, 90);
    //text(`Chord Length: ${this.chordLength.toFixed(1)} px`, 10, 110);
  }

  _drawRadius() {
    stroke(0, 100, 255);
    strokeWeight(2);
    line(this.arcCenter.x, this.arcCenter.y, this.p1.x, this.p1.y);

    let angle = atan2(this.p1.y - this.arcCenter.y, this.p1.x - this.arcCenter.x);
    this._drawArrowhead(this.p1.x, this.p1.y, angle, 10, color(0, 100, 255));
    this._drawArrowhead(this.arcCenter.x, this.arcCenter.y, angle + PI, 10, color(0, 100, 255));

    // Midpoint of the line
    let midX = (this.arcCenter.x + this.p1.x) / 2;
    let midY = (this.arcCenter.y + this.p1.y) / 2;

    // Perpendicular offset
    let dx = this.p1.x - this.arcCenter.x;
    let dy = this.p1.y - this.arcCenter.y;
    let mag = sqrt(dx * dx + dy * dy);
    let offset = -12;

    let perpX = -dy / mag * offset;
    let perpY = dx / mag * offset;

    let r = dist(this.arcCenter.x, this.arcCenter.y, this.p1.x, this.p1.y);
    // Draw rotated label
    push();
    translate(midX + perpX, midY + perpY);
    rotate(angle);
    fill(0, 100, 255);
    noStroke();
    textAlign(CENTER, CENTER);
    textSize(14);
    text("r = " + round(r / 100, 1), 0, 0);
    pop();
  }

  updateDimensions() {
    this.width = windowWidth;
    this.height = windowHeight;
  }
}
