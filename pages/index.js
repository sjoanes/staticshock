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
    const sun = new Sun();

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

    animator(leaves, sun)();
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

class Sun {
  constructor() {
    this.x = 0;
    this.y = canvas.height / 2;
    this.size = 100;
  }

  update () {
    const origin_x = 0;
    const origin_y = canvas.height;
    const ROTATE = Math.PI/400;

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
    const CRESCENT_OPENING = Math.PI/2;

    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(moon_x, moon_y, this.size, Math.PI*0.3, Math.PI * 1.56);
    ctx.arc(moon_x + 40, moon_y - 10, this.size-10, Math.PI*1.42, Math.PI*0.42, true);
    ctx.fill();
    
  }
}


function animator(leaves, sun) {
  return function animate() {
    // sky
    var sky = ctx.createLinearGradient(0, canvas.height - 250, 0, 0);
    sky.addColorStop(0, "#8fd1ee");
    sky.addColorStop(1, "#1d97d8");
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // name
    ctx.font = `80px Tahoma `;
    ctx.fillStyle = 'white';
    ctx.fillText("SAVIO", 10, 80);

    sun.draw();
    sun.update();

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
      leaf.update();
      leaf.draw();
    }
    requestAnimationFrame(animate);
  }
}
