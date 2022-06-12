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
    const leaves = Array.from(Array(50).keys()).map(() => new Leaves(hand));

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

    animator(leaves)();
  }, []);
  return <canvas id="canvas1" />
}

class Leaves {
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


function animator(leaves) {
  return function animate() {
    var sky = ctx.createLinearGradient(0, canvas.height - 250, 0, 0);
    sky.addColorStop(0, "#8fd1ee");
    sky.addColorStop(1, "#1d97d8");
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.font = `80px Tahoma `;
    ctx.fillStyle = 'white';
    ctx.fillText("SAVIO", 10, 80);

    ctx.fillStyle = '#f5f0d8';
    ctx.beginPath();
    ctx.moveTo(canvas.width/2, canvas.height);
    ctx.lineTo(canvas.width, canvas.height);
    ctx.lineTo(canvas.width, canvas.height-100);
    ctx.fill();
    ctx.fillStyle = '#49bcb9cc';
    ctx.fillRect(0, canvas.height-50, canvas.width, 50);
    for (const leaf of leaves) {
      leaf.update();
      leaf.draw();
    }
    requestAnimationFrame(animate);
  }
}
