import React from 'react'

let ctx
let canvas

export default function Home() {
  React.useEffect(() => {
    canvas = window.document.getElementById('canvas1')
    ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const hand = new Hand();
    const leaves = Array.from(Array(50).keys()).map(() => new Leaf(hand));

    canvas.addEventListener('mousemove', function(e) {
      hand.x = e.pageX;
      hand.y = e.pageY;
    });
    canvas.addEventListener('mousedown', function(e) {
      hand.close = true;
    });
    canvas.addEventListener('mouseup', function(e) {
      hand.close = false;
    });
    canvas.addEventListener('touchstart', function(e) {
      hand.close = true;
    });
    canvas.addEventListener('touchend', function(e) {
      hand.close = false;
    });
    window.addEventListener('resize', function(e) {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    });

    animator(leaves, new Sun(), new Sky())();
  }, []);
  return <canvas id="canvas1" />
}

class Leaf {
  constructor(hand) {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.size = 10;
    this.velocityY = 2;
    this.velocityX = 0;
    this.hand = hand;
  }

  update() {
    if (this.hand.close) {
      const direction = this.x - this.hand.x < 0 ? 1 : -1;
      if (this.velocityX === 0) {
        this.velocityX = direction;
      } else {
        this.velocityX += direction * (0.1 * Math.random());
      }
      const directionY = this.y - this.hand.y < 0 ? 1 : -1;
      if (this.velocityY === 0) {
        this.velocityY = directionY;
      } else {
        this.velocityY += directionY * (0.1 * Math.random());
      }
    } else {
      this.velocityY -= -0.05;
      if (this.y > canvas.height-50) {
        this.velocityY = 0;
      }
    }
    this.y += this.velocityY;
    this.y = Math.min(canvas.height - this.size, this.y);

    this.x += this.velocityX;
    this.x = Math.max(0, this.x);
    this.x = Math.min(canvas.width, this.x);
  }

  draw() {
    ctx.fillStyle = '#48c73f';
    ctx.beginPath();
    const angle = this.velocityX + this.velocityY * Math.PI;
    ctx.arc(this.x, this.y, this.size, angle, angle + Math.PI);
    const leafTip = this.size*-2;
    ctx.lineTo(
      0*Math.cos(angle) - leafTip*Math.sin(angle)+ this.x,
      leafTip*Math.cos(angle) + 0*Math.sin(angle) + this.y
    );
    ctx.closePath();
    ctx.fill();
  }
}

class Hand {
  constructor() {
    this.x = canvas.width / 2;
    this.y = canvas.height / 2;
    this.size = 100;
    this.close = false;
  }

  draw() {}
}

const DAY_DURATION = 15000;

class Sun {
  constructor() {
    this.x = 0;
    this.y = canvas.height / 2;
    this.size = 100;
    this.previousRotation = 0;
  }

  update (elapsed) {
    const origin_x = 0;
    const origin_y = canvas.height;
    const delta = (elapsed % DAY_DURATION)/DAY_DURATION - this.previousRotation
    this.previousRotation = (elapsed % DAY_DURATION)/DAY_DURATION;
    const ROTATE = (2*Math.PI)*delta;

    this.x = Math.cos(ROTATE) * (this.x - origin_x) - Math.sin(ROTATE) * (this.y - origin_y) + origin_x;
    this.y = Math.sin(ROTATE) * (this.x - origin_x) + Math.cos(ROTATE) * (this.y - origin_y) + origin_y;
  }

  draw() {
    // sun
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, 2*Math.PI);
    ctx.fill();

    // moon
    const origin_x = 0;
    const origin_y = canvas.height;
    const moon_x = Math.cos(Math.PI) * (this.x - origin_x) - Math.sin(Math.PI) * (this.y - origin_y) + origin_x;
    const moon_y = Math.sin(Math.PI) * (this.x - origin_x) + Math.cos(Math.PI) * (this.y - origin_y) + origin_y;

    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(moon_x, moon_y, this.size, Math.PI*0.3, Math.PI * 1.56);
    ctx.arc(moon_x + 40, moon_y - 10, this.size-10, Math.PI*1.42, Math.PI*0.42, true);
    ctx.fill();
  }
}

const noon1 = [143, 209, 238];
const noon2 = [29, 151, 216];
class Sky {
  constructor() {
    this.color1 = [...noon1];
    this.color2 = [...noon2];
    this.previousFrame;
    this.cycle = [
      [noon1, noon2],
      [[249, 60, 41], [255, 150, 70]],
      [[0, 72, 129], [0, 0, 0]],
      [[0, 72, 129], [0, 0, 0]],
    ];
  }

  update(elapsed) {
    const CYCLE_DURATION = DAY_DURATION/this.cycle.length;
    const frame = (elapsed % CYCLE_DURATION)/CYCLE_DURATION;
    if (this.previousFrame > frame) {
      const head = this.cycle.shift();
      this.cycle.push(head);
    }
    this.previousFrame = frame;
    const currentColor = this.cycle[0];
    const targetColor = this.cycle[1];
    this.color1[0] = currentColor[0][0] + (targetColor[0][0] - currentColor[0][0])*frame;
    this.color1[1] = currentColor[0][1] + (targetColor[0][1] - currentColor[0][1])*frame;
    this.color1[2] = currentColor[0][2] + (targetColor[0][2] - currentColor[0][2])*frame;

    this.color2[0] = currentColor[1][0] + (targetColor[1][0] - currentColor[1][0])*frame;
    this.color2[1] = currentColor[1][1] + (targetColor[1][1] - currentColor[1][1])*frame;
    this.color2[2] = currentColor[1][2] + (targetColor[1][2] - currentColor[1][2])*frame;
  }

  draw() {
    var sky = ctx.createLinearGradient(0, canvas.height - 250, 0, 0);
    sky.addColorStop(0, `rgb(${this.color1[0]}, ${this.color1[1]}, ${this.color1[2]})`);
    sky.addColorStop(1, `rgb(${this.color2[0]}, ${this.color2[1]}, ${this.color2[2]})`);
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
}

let start;
function animator(leaves, sun, sky) {
  return function animate(timestamp) {
    if (start === undefined) {
      start = timestamp;
    }
    const elapsed = timestamp - start || 0;
    // sky
    sky.draw();
    sky.update(elapsed);
    // name
    ctx.font = `80px Tahoma `;
    ctx.fillStyle = 'white';
    ctx.fillText("SAVIO", 10, 80);

    sun.draw();
    sun.update(elapsed, timestamp);

    // beach
    ctx.fillStyle = '#f5f0d8';
    ctx.beginPath();
    ctx.moveTo(canvas.width/2, canvas.height);
    ctx.lineTo(canvas.width, canvas.height);
    ctx.lineTo(canvas.width, canvas.height-100);
    ctx.fill();
    ctx.fillStyle = '#49bcb9cc';

    // ocean
    ctx.fillRect(0, canvas.height-50, canvas.width, 50);

    for (const leaf of leaves) {
      leaf.draw();
      leaf.update(elapsed);
    }
    requestAnimationFrame(animate);
  }
}
