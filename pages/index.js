import React from 'react'
import SimplexNoise from './SimplexNoise'



export default function Home() {
  React.useEffect(() => {
    const { PI, cos, sin, abs, sqrt, pow, round, random, atan2 } = Math;
    const HALF_PI = 0.5 * PI;
    const TAU = 2 * PI;
    const TO_RAD = PI / 180;
    const floor = n => n | 0;
    const rand = n => n * random();
    const randIn = (min, max) => rand(max - min) + min;
    const randRange = n => n - rand(2 * n);
    const fadeIn = (t, m) => t / m;
    const fadeOut = (t, m) => (m - t) / m;
    const fadeInOut = (t, m) => {
      let hm = 0.5 * m;
      return abs((t + hm) % m - hm) / (hm);
    };
    const dist = (x1, y1, x2, y2) => sqrt(pow(x2 - x1, 2) + pow(y2 - y1, 2));
    const angle = (x1, y1, x2, y2) => atan2(y2 - y1, x2 - x1);
    const lerp = (n1, n2, speed) => (1 - speed) * n1 + speed * n2;
    /*
     * A fast javascript implementation of simplex noise by Jonas Wagner
    
    Based on a speed-improved simplex noise algorithm for 2D, 3D and 4D in Java.
    Which is based on example code by Stefan Gustavson (stegu@itn.liu.se).
    With Optimisations by Peter Eastman (peastman@drizzle.stanford.edu).
    Better rank ordering method by Stefan Gustavson in 2012.
    
     Copyright (c) 2018 Jonas Wagner
    
     Permission is hereby granted, free of charge, to any person obtaining a copy
     of this software and associated documentation files (the "Software"), to deal
     in the Software without restriction, including without limitation the rights
     to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     copies of the Software, and to permit persons to whom the Software is
     furnished to do so, subject to the following conditions:
    
     The above copyright notice and this permission notice shall be included in all
     copies or substantial portions of the Software.
    
     THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
     SOFTWARE.
     */
    (function() {
      'use strict';
    

    
      /*
      The ALEA PRNG and masher code used by simplex-noise.js
      is based on code by Johannes BaagÃ¸e, modified by Jonas Wagner.
      See alea.md for the full license.
      */
      function alea() {
        var s0 = 0;
        var s1 = 0;
        var s2 = 0;
        var c = 1;
    
        var mash = masher();
        s0 = mash(' ');
        s1 = mash(' ');
        s2 = mash(' ');
    
        for (var i = 0; i < arguments.length; i++) {
          s0 -= mash(arguments[i]);
          if (s0 < 0) {
            s0 += 1;
          }
          s1 -= mash(arguments[i]);
          if (s1 < 0) {
            s1 += 1;
          }
          s2 -= mash(arguments[i]);
          if (s2 < 0) {
            s2 += 1;
          }
        }
        mash = null;
        return function() {
          var t = 2091639 * s0 + c * 2.3283064365386963e-10; // 2^-32
          s0 = s1;
          s1 = s2;
          return s2 = t - (c = t | 0);
        };
      }
      function masher() {
        var n = 0xefc8249d;
        return function(data) {
          data = data.toString();
          for (var i = 0; i < data.length; i++) {
            n += data.charCodeAt(i);
            var h = 0.02519603282416938 * n;
            n = h >>> 0;
            h -= n;
            h *= n;
            n = h >>> 0;
            h -= n;
            n += h * 0x100000000; // 2^32
          }
          return (n >>> 0) * 2.3283064365386963e-10; // 2^-32
        };
      }
    
      // amd
      if (typeof define !== 'undefined' && define.amd) define(function() {return SimplexNoise;});
      // common js
      if (typeof exports !== 'undefined') exports.SimplexNoise = SimplexNoise;
      // browser
      else if (typeof window !== 'undefined') window.SimplexNoise = SimplexNoise;
      // nodejs
      if (typeof module !== 'undefined') {
        module.exports = SimplexNoise;
      }
    
    })();
    const particleCount = 700;
    const particlePropCount = 9;
    const particlePropsLength = particleCount * particlePropCount;
    const rangeY = 100;
    const baseTTL = 50;
    const rangeTTL = 150;
    const baseSpeed = 0.1;
    const rangeSpeed = 2;
    const baseRadius = 1;
    const rangeRadius = 4;
    const baseHue = 220;
    const rangeHue = 100;
    const noiseSteps = 8;
    const xOff = 0.00125;
    const yOff = 0.00125;
    const zOff = 0.0005;
    const backgroundColor = 'hsla(260,40%,5%,1)';
    
    let container;
    let canvas;
    let ctx;
    let center;
    let gradient;
    let tick;
    let simplex;
    let particleProps;
    let positions;
    let velocities;
    let lifeSpans;
    let speeds;
    let sizes;
    let hues;
    
    function setup() {
      createCanvas();
      resize();
      initParticles();
      draw();
    }
    
    function initParticles() {
      tick = 0;
      simplex = new SimplexNoise();
      particleProps = new Float32Array(particlePropsLength);
    
      let i;
      
      for (i = 0; i < particlePropsLength; i += particlePropCount) {
        initParticle(i);
      }
    }
    
    function initParticle(i) {
      let x, y, vx, vy, life, ttl, speed, radius, hue;
    
      x = rand(canvas.a.width);
      y = center[1] + randRange(rangeY);
      vx = 0;
      vy = 0;
      life = 0;
      ttl = baseTTL + rand(rangeTTL);
      speed = baseSpeed + rand(rangeSpeed);
      radius = baseRadius + rand(rangeRadius);
      hue = baseHue + rand(rangeHue);
    
      particleProps.set([x, y, vx, vy, life, ttl, speed, radius, hue], i);
    }
    
    function drawParticles() {
      let i;
    
      for (i = 0; i < particlePropsLength; i += particlePropCount) {
        updateParticle(i);
      }
    }
    
    function updateParticle(i) {
      let i2=1+i, i3=2+i, i4=3+i, i5=4+i, i6=5+i, i7=6+i, i8=7+i, i9=8+i;
      let n, x, y, vx, vy, life, ttl, speed, x2, y2, radius, hue;
    
      x = particleProps[i];
      y = particleProps[i2];
      n = simplex.noise3D(x * xOff, y * yOff, tick * zOff) * noiseSteps * TAU;
      vx = lerp(particleProps[i3], cos(n), 0.5);
      vy = lerp(particleProps[i4], sin(n), 0.5);
      life = particleProps[i5];
      ttl = particleProps[i6];
      speed = particleProps[i7];
      x2 = x + vx * speed;
      y2 = y + vy * speed;
      radius = particleProps[i8];
      hue = particleProps[i9];
    
      drawParticle(x, y, x2, y2, life, ttl, radius, hue);
    
      life++;
    
      particleProps[i] = x2;
      particleProps[i2] = y2;
      particleProps[i3] = vx;
      particleProps[i4] = vy;
      particleProps[i5] = life;
    
      (checkBounds(x, y) || life > ttl) && initParticle(i);
    }
    
    function drawParticle(x, y, x2, y2, life, ttl, radius, hue) {
      ctx.a.save();
      ctx.a.lineCap = 'round';
      ctx.a.lineWidth = radius;
      ctx.a.strokeStyle = `hsla(${hue},100%,60%,${fadeInOut(life, ttl)})`;
      ctx.a.beginPath();
      ctx.a.moveTo(x, y);
      ctx.a.lineTo(x2, y2);
      ctx.a.stroke()
      ctx.a.closePath();
      ctx.a.restore();
    }
    
    function checkBounds(x, y) {
      return(
        x > canvas.a.width ||
        x < 0 ||
        y > canvas.a.height ||
        y < 0
      );
    }
    
    function createCanvas() {
      container = document.querySelector('.content--canvas');
      canvas = {
        a: document.createElement('canvas'),
        b: document.createElement('canvas')
      };
      canvas.b.style = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
      `;
      container.appendChild(canvas.b);
      ctx = {
        a: canvas.a.getContext('2d'),
        b: canvas.b.getContext('2d')
      };
      center = [];
    }
    
    function resize() {
      const { innerWidth, innerHeight } = window;
      
      canvas.a.width = innerWidth;
      canvas.a.height = innerHeight;
    
      ctx.a.drawImage(canvas.b, 0, 0);
    
      canvas.b.width = innerWidth;
      canvas.b.height = innerHeight;
      
      ctx.b.drawImage(canvas.a, 0, 0);
    
      center[0] = 0.5 * canvas.a.width;
      center[1] = 0.5 * canvas.a.height;
    }
    
    function renderGlow() {
      ctx.b.save();
      ctx.b.filter = 'blur(8px) brightness(200%)';
      ctx.b.globalCompositeOperation = 'lighter';
      ctx.b.drawImage(canvas.a, 0, 0);
      ctx.b.restore();
    
      ctx.b.save();
      ctx.b.filter = 'blur(4px) brightness(200%)';
      ctx.b.globalCompositeOperation = 'lighter';
      ctx.b.drawImage(canvas.a, 0, 0);
      ctx.b.restore();
    }
    
    function renderToScreen() {
      ctx.b.save();
      ctx.b.globalCompositeOperation = 'lighter';
      ctx.b.drawImage(canvas.a, 0, 0);
      ctx.b.restore();
    }
    
    function draw() {
      tick++;
    
      ctx.a.clearRect(0, 0, canvas.a.width, canvas.a.height);
    
      ctx.b.fillStyle = backgroundColor;
      ctx.b.fillRect(0, 0, canvas.a.width, canvas.a.height);
    
      drawParticles();
      renderGlow();
      renderToScreen();
    
      window.requestAnimationFrame(draw);
    }
    
    window.addEventListener('load', setup);
    window.addEventListener('resize', resize);
  });
  return (
<html>
<body class="content--canvas" style={{background: "black"}}>
	<nav class="game--nav">SAVIO</nav>
	<div class="content--game">
		<div class="content--area">
			<div class="content--prompt" id="game">FIND ME @</div>
			<a href="https://www.youtube.com/user/Bakayaroz" class="content--prompt">https://www.youtube.com/user/Bakayaroz</a>
			<a href="https://soundcloud.com/savio-joanes" class="content--prompt">https://soundcloud.com/savio-joanes</a>
      <a href="https://github.com/sjoanes" class="content--prompt">https://github.com/sjoanes</a>
		</div>
		<div id="content-lives">
			<div class="pulsingheart"></div>
		</div>
	</div>
<canvas width="963" height="1304" style={{position: 'fixed', top: '0px', left: '0px', width: '100%', height: '100%'}}></canvas></body></html>
  )
}
