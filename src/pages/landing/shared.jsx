import { useRef, useState } from "react";
import { ArrowRight, SpeakerHigh, SpeakerSlash } from "@phosphor-icons/react";
import { CHECKOUT_PATH } from "../../routes.js";

export const CHECKOUT_TARGET = CHECKOUT_PATH;
export const PRICE_LABEL = "\u20B91,999 + GST";
export const HERO_PRICE_LABEL = `Today's Price ${PRICE_LABEL}`;

export function Button({ children = "Show Me What Suits Me", light = false, className = "", showIcon = true }) {
  return (
    <a className={`button ${light ? "button-light" : ""} ${className}`} href={CHECKOUT_TARGET}>
      <span>{children}</span>
      {showIcon ? <ArrowRight size={20} weight="regular" aria-hidden="true" /> : null}
    </a>
  );
}

export function SoundVideo({ className, src, label }) {
  const videoRef = useRef(null);
  const [soundOn, setSoundOn] = useState(false);

  const handleSoundToggle = () => {
    const video = videoRef.current;
    if (!video) return;

    const nextSoundOn = !soundOn;
    video.muted = !nextSoundOn;

    if (!nextSoundOn) {
      setSoundOn(false);
      return;
    }

    video.volume = 1;
    const playPromise = video.play();

    if (playPromise?.then) {
      playPromise
        .then(() => setSoundOn(true))
        .catch(() => {
          video.muted = true;
          setSoundOn(false);
        });
      return;
    }

    setSoundOn(true);
  };

  return (
    <figure className={className}>
      <video ref={videoRef} autoPlay muted={!soundOn} loop playsInline aria-label={label}>
        <source src={src} type="video/mp4" />
      </video>
      <button
        className={`video-sound-button ${soundOn ? "video-sound-button-on" : ""}`}
        type="button"
        onClick={handleSoundToggle}
        aria-label={soundOn ? "Mute video sound" : "Play video sound"}
        aria-pressed={soundOn}
      >
        {soundOn ? (
          <SpeakerHigh size={18} weight="fill" aria-hidden="true" />
        ) : (
          <SpeakerSlash size={18} weight="fill" aria-hidden="true" />
        )}
        <span>{soundOn ? "Sound on" : "Tap for sound"}</span>
      </button>
    </figure>
  );
}

export function SectionHeading({ children, intro, align = "center" }) {
  return (
    <div className={`section-heading section-heading-${align}`}>
      <h2>{children}</h2>
      {intro ? <p className="section-intro">{intro}</p> : null}
    </div>
  );
}
