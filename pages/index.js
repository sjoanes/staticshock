import React from 'react'
import ParticleAnimation from './ParticleAnimation'



export default function Home() {
  React.useEffect(ParticleAnimation);
  return (
    <html>
      <body className="content--canvas" style={{background: "black"}}>
        <nav className="game--nav">SAVIO</nav>
        <div className="content--game">
          <div className="content--area">
            <div className="content--prompt" id="game">NEW GAME?</div>
            <a href="https://www.youtube.com/user/Bakayaroz" className="content--prompt">https://www.youtube.com/user/Bakayaroz</a>
            <a href="https://soundcloud.com/savio-joanes" className="content--prompt">https://soundcloud.com/savio-joanes</a>
            <a href="https://github.com/sjoanes" className="content--prompt">https://github.com/sjoanes</a>
          </div>
        </div>
        <canvas width="963" height="1304" style={{position: 'fixed', top: '0px', left: '0px', width: '100%', height: '100%'}}>
        </canvas>
      </body>i
    </html>
  )
}
