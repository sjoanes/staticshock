import React from 'react'
import ParticleAnimation from './ParticleAnimation'



export default function Home() {
  const [showContact, setShowContact] = React.useState(true);
  React.useEffect(ParticleAnimation);
  return (
      <div className="content--canvas" style={{background: "black"}}>
        <nav className="game--nav">SAVIO</nav>
        <div className="content--game">
          {
            showContact ? (
              <div className="content--area">
              <div className="content--prompt" id="game">CONTACT</div>
              <a href="https://www.youtube.com/user/Bakayaroz" className="content--prompt">https://www.youtube.com/user/Bakayaroz</a>
              <a href="https://soundcloud.com/savio-joanes" className="content--prompt">https://soundcloud.com/savio-joanes</a>
              <a href="https://github.com/sjoanes" className="content--prompt">https://github.com/sjoanes</a>
              <button onClick={() => (setShowContact(false))} className="content--prompt" id="game">ENTER</button>
              </div>
            ) : null
          }
        </div>
        <canvas width="963" height="1304" style={{position: 'fixed', top: '0px', left: '0px', width: '100%', height: '100%'}}>
        </canvas>
      </div>
  )
}
