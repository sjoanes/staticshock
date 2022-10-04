import React from 'react'

let ctx;
let canvas;
let DAY_DURATION = 15000;
const COASTLINE = 2;

export default function Home() {
  React.useEffect(() => {
    canvas = window.document.getElementById('canvas1')
    ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const beach = new Beach();
    const hand = new Hand();
    const leaves = Array.from(Array(25).keys()).map(() => new Leaf(hand, beach));

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

    animator(leaves, new AstralEntites(hand, leaves), new Sky(), beach)();
  }, []);
  return <canvas id="canvas1" />
}

function rotate(x, y, origin_x, origin_y, angle) {
  return {
    x: Math.cos(angle) * (x - origin_x) - Math.sin(angle) * (y - origin_y) + origin_x,
    y: Math.sin(angle) * (x - origin_x) + Math.cos(angle) * (y - origin_y) + origin_y,
  };
}

class Leaf {
  constructor(hand, beach) {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.size = 3;
    this.velocityY = 2;
    this.velocityX = 0;
    this.hand = hand;
    this.jitter = Math.random() * (canvas.height - 10 - beach.waterHeight);
    this.beach = beach;
    this.isometricY = beach.waterHeight + this.jitter;
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
      this.velocityX = Math.min(3, this.velocityX)
      this.velocityX = Math.max(-3, this.velocityX)
      this.velocityY = Math.max(-3, this.velocityY)
      this.velocityY = Math.max(-3, this.velocityY)
    } else {
      this.velocityY -= -0.05;
      if (this.y >= this.isometricY) {
        this.velocityY = 0;
        this.y = this.isometricY;
        this.velocityX = this.beach.waveAccel;
      }
      if (this.y > this.beach.waterHeight) {
        const beachHeight = canvas.height - this.beach.waterHeight
        const slope = beachHeight/(canvas.width/COASTLINE);
        const coastX = (beachHeight - this.jitter)/slope;
        if (this.x > (canvas.width/COASTLINE) + coastX + this.beach.wave) {
          this.velocityX = 0;
        }
      }
    }

    this.y += this.velocityY;
    this.y = Math.min(canvas.height - this.size, this.y);

    this.x += this.velocityX;
    if (this.x < 0) {
      this.x = canvas.width;
    } else if (this.x > canvas.width) {
      this.x = 0;
    }
  }

  draw() {
    ctx.fillStyle = 'red';
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

class AstralEntites {
  constructor(hand, leaves) {
    const origin_x = 0;
    const origin_y = canvas.height;

    this.x = 0;
    this.y = canvas.height / 2;
    this.size = 100;
    this.previousElapsed = 0;
    this.hand = hand;
    this.leaves = leaves;

    this.stars = Array.from(Array(200).keys()).map(() => ({
      x: canvas.width*2 * Math.random(),
      y: canvas.height*2 * Math.random(),
    })).map(star => rotate(star.x, star.y, origin_x, origin_y, Math.PI*0.5));;
  }

  update (elapsed) {
    if (this.hand.close) {
      DAY_DURATION = Math.max(DAY_DURATION - 100, 5000);
    } else {
      DAY_DURATION = Math.min(DAY_DURATION + 50, 10000);
    }
    const origin_x = 0;
    const origin_y = canvas.height;
    const delta = (elapsed - this.previousElapsed)/DAY_DURATION;
    this.previousElapsed = elapsed;

    if (this.hand.close) {
      let hitCount = 0;
      for (let leaf of this.leaves) {
        const distance = Math.sqrt(Math.pow(this.x - leaf.x, 2) + Math.pow(this.y - leaf.y, 2));
        hitCount += distance <= this.size ? 1 : 0;
      }
      if (hitCount >= this.leaves.length - 10) {
        this.x = this.hand.x;
        this.y = this.hand.y;
        return;
      }
    }

    const ROTATE = (Math.PI)*delta;

    const new_pos = rotate(this.x, this.y, origin_x, origin_y, ROTATE);
    this.x = new_pos.x;
    this.y = new_pos.y;
    this.stars = this.stars.map(star => rotate(star.x, star.y, origin_x, origin_y, ROTATE));
  }

  draw() {
    const origin_x = 0;
    const origin_y = canvas.height;

    // sun
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, 2*Math.PI);
    ctx.fill();

    // moon
    const moon_x = Math.cos(Math.PI) * (this.x - origin_x) - Math.sin(Math.PI) * (this.y - origin_y) + origin_x;
    const moon_y = Math.sin(Math.PI) * (this.x - origin_x) + Math.cos(Math.PI) * (this.y - origin_y) + origin_y;

    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(moon_x, moon_y, this.size, Math.PI*0.3, Math.PI * 1.56);
    ctx.arc(moon_x + 40, moon_y - 10, this.size-10, Math.PI*1.42, Math.PI*0.42, true);
    ctx.fill();

    // stars
    for (const star of this.stars) {
      ctx.beginPath();
      ctx.arc(star.x, star.y, 1, Math.PI*0, Math.PI * 2);
      ctx.fill();
    }
  }
}

class Sky {
  constructor() {
    this.color1 = [143, 209, 238];
    this.color2 = [29, 151, 216];
    this.previousElapsed = 0;
    this.cycle = [
      [[143, 209, 238], [29, 151, 216]],
      [[249, 60, 41], [255, 150, 70]],
      [[0, 0, 0], [0, 0, 0]],
      [[0, 72, 129], [0, 0, 0]],
    ];
    this.change = 0;
  }

  update(elapsed) {
    const delta = (elapsed - this.previousElapsed)/(DAY_DURATION/this.cycle.length);
    this.previousElapsed = elapsed;
    const currentColor = this.cycle[0];
    const targetColor = this.cycle[1];
    this.color1[0] += (targetColor[0][0] - currentColor[0][0])*delta;
    this.color1[1] += (targetColor[0][1] - currentColor[0][1])*delta;
    this.color1[2] += (targetColor[0][2] - currentColor[0][2])*delta;

    this.color2[0] += (targetColor[1][0] - currentColor[1][0])*delta;
    this.color2[1] += (targetColor[1][1] - currentColor[1][1])*delta;
    this.color2[2] += (targetColor[1][2] - currentColor[1][2])*delta;

    this.change += delta;
    while (this.change > 1) {
      this.change -= 1;
      const head = this.cycle.shift();
      const nextColor = this.cycle[0];
      this.color1[0] = nextColor[0][0];
      this.color1[1] = nextColor[0][1];
      this.color1[2] = nextColor[0][2];
  
      this.color2[0] = nextColor[1][0];
      this.color2[1] = nextColor[1][1];
      this.color2[2] = nextColor[1][2];
      this.cycle.push(head);
    }
  }

  draw() {
    var sky = ctx.createLinearGradient(0, canvas.height - 250, 0, 0);
    sky.addColorStop(0, `rgb(${this.color1[0]}, ${this.color1[1]}, ${this.color1[2]})`);
    sky.addColorStop(1, `rgb(${this.color2[0]}, ${this.color2[1]}, ${this.color2[2]})`);
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
}

class Beach {
  constructor() {
    this.tide = 0;
    this.direction = 1;
    this.previousElapsed = 0;
    this.waterHeight = canvas.height - 50;
    this.wave = 0;
  }

  update(elapsed) {
    const timeScale = 1000;
    this.waveAccel = -1 * (Math.sin(elapsed/timeScale) + 0.1);
    this.wave = (Math.cos(elapsed/timeScale) + 1)/2 * 200;
    this.transparency = (1 - (Math.cos(elapsed/timeScale) + 1)/2);
  }

  draw() {
    // water
    ctx.fillStyle = `rgb(73, 188, 185, 0.999)`;
    ctx.beginPath();
    ctx.moveTo(0, this.waterHeight);
    ctx.lineTo(0, canvas.height);
    ctx.lineTo(canvas.width / COASTLINE, canvas.height);
    ctx.lineTo(canvas.width, this.waterHeight);
    ctx.fill();

    // sand
    ctx.fillStyle = '#f5f0d8';
    ctx.beginPath();
    ctx.moveTo(canvas.width / COASTLINE, canvas.height);
    ctx.lineTo(canvas.width, canvas.height);
    ctx.lineTo(canvas.width, this.waterHeight);
    ctx.fill();

    // wave
    ctx.fillStyle = `rgb(235, 227, 187, ${1 - this.transparency})`;
    ctx.fillStyle = `rgb(73, 188, 185, ${this.transparency})`;
    ctx.beginPath();
    ctx.moveTo(canvas.width - 2, this.waterHeight);
    ctx.lineTo(canvas.width / COASTLINE - 2, canvas.height);
    ctx.lineTo(canvas.width / COASTLINE + this.wave, canvas.height);
    ctx.lineTo(canvas.width + this.wave, this.waterHeight);
    ctx.fill();
  }
}

let start;
function animator(leaves, sun, sky, beach) {
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

    beach.draw();
    beach.update(elapsed)

    for (const leaf of leaves) {
      leaf.draw();
      leaf.update(elapsed);
    }
    requestAnimationFrame(animate);
  }
}
