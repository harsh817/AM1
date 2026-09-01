import { useState } from "react";
import { Minus, Plus, Star } from "@phosphor-icons/react";
import { faqs, testimonials } from "../../lib/landing-data.js";
import { SectionHeading } from "./shared.jsx";

export function SocialProof() {
  return (
    <section className="section proof section-editorial-preview proof-editorial" id="reviews">
      <div className="shell">
        <SectionHeading>
          What Clients <span>Say</span>
        </SectionHeading>
        <div className="testimonial-ledger" aria-label="StyleIQ customer reviews">
          {testimonials.map((item) => (
            <article className="testimonial-entry" key={item.quote}>
              <div className="testimonial-entry-content">
                <div className="testimonial-client">
                  <img
                    className="testimonial-photo"
                    src={item.image}
                    alt={`${item.name} customer photo`}
                    loading="lazy"
                    decoding="async"
                    width={item.imageWidth}
                    height={item.imageHeight}
                  />
                  <div className="testimonial-client-copy">
                    <strong>{item.name}</strong>
                    {item.meta && <small>{item.meta}</small>}
                  </div>
                </div>
                <div className="testimonial-rating" aria-label="Five stars">
                  {Array.from({ length: 5 }).map((_, star) => <Star key={star} size={18} weight="fill" />)}
                </div>
                <blockquote>{item.quote}</blockquote>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function FAQ() {
  const [open, setOpen] = useState(0);

  return (
    <section className="section faq section-editorial-preview faq-editorial" id="faq">
      <div className="shell faq-shell">
        <SectionHeading>
          Frequently asked <span>questions</span>
        </SectionHeading>
        <div className="faq-list">
          {faqs.map(([question, answer], index) => {
            const isOpen = open === index;
            return (
              <article className={isOpen ? "open" : ""} key={question}>
                <button type="button" onClick={() => setOpen(isOpen ? -1 : index)} aria-expanded={isOpen}>
                  <span>{question}</span>
                  {isOpen ? (
                    <Minus size={24} weight="regular" aria-hidden="true" />
                  ) : (
                    <Plus size={24} weight="regular" aria-hidden="true" />
                  )}
                </button>
                <div className="faq-answer" aria-hidden={!isOpen}><p>{answer}</p></div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="site-footer" id="footer">
      <div className="shell footer-inner">
        <nav className="footer-legal-links" aria-label="Legal links">
          <a href="/privacy">Privacy Policy</a>
          <a href="/terms">Terms &amp; Conditions</a>
        </nav>
        <div className="footer-disclaimer">
          <p>&copy; 2026 AttractiveMen. All rights reserved.</p>
          <p>This page is not affiliated with Facebook or Meta Platforms, Inc., and is not endorsed by Facebook in any way.</p>
        </div>
      </div>
      <div className="footer-wordmark" aria-label="AttractiveMen">AttractiveMen</div>
    </footer>
  );
}
