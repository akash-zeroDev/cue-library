import { useRef, useState } from 'react'

export default function CardThumb({ brand, variant = 'sans', thumbSrc, hoverSrc }) {
  const [hover, setHover] = useState(false)
  const videoRef = useRef(null)

  const hasMedia = Boolean(thumbSrc || hoverSrc)

  const onEnter = () => {
    setHover(true)
    if (hoverSrc && videoRef.current) {
      videoRef.current.currentTime = 0
      videoRef.current.play().catch(() => { /* ignore autoplay reject */ })
    }
  }
  const onLeave = () => {
    setHover(false)
    if (hoverSrc && videoRef.current) videoRef.current.pause()
  }

  if (hasMedia) {
    return (
      <div className="thumb thumb-media" onMouseEnter={onEnter} onMouseLeave={onLeave}>
        {thumbSrc && (
          <img
            className="thumb-img"
            src={thumbSrc}
            alt=""
            style={{ opacity: hover && hoverSrc ? 0 : 1 }}
            loading="lazy"
          />
        )}
        {hoverSrc && (
          <video
            ref={videoRef}
            className="thumb-video"
            src={hoverSrc}
            muted
            loop
            playsInline
            preload="metadata"
            style={{ opacity: hover ? 1 : 0 }}
          />
        )}
        {!thumbSrc && !hover && hoverSrc && (
          <div className="thumb-body">
            <div className={`thumb-brand ${variant}`}>{brand}</div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="thumb">
      <div className="thumb-nav">
        <span className="thumb-logo" aria-hidden="true" />
        <span className="thumb-links" aria-hidden="true">
          <i /><i /><i />
        </span>
      </div>
      <div className="thumb-body">
        <div className={`thumb-brand ${variant}`}>{brand}</div>
        <div className="thumb-line" />
        <div className="thumb-line thumb-line-s" />
      </div>
    </div>
  )
}
