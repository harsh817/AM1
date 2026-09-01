import { Fragment } from "react";
import { Check, ClockCountdown, SealCheck, X } from "@phosphor-icons/react";
import {
  bonuses,
  comparisonRows,
  processSteps,
  recapItems,
  reportContentGroups,
  styleIqPillars,
} from "../../lib/landing-data.js";
import { Button, PRICE_LABEL, SectionHeading, SoundVideo } from "./shared.jsx";

export function StyleIqSystem() {
  return (
    <section className="section approach section-editorial-preview styleiq-editorial" id="styleiq">
      <div className="shell narrow-shell approach-shell">
        <SectionHeading>
          Your <span>StyleIQ</span>
        </SectionHeading>
        <div className="copy-stack styleiq-system-copy">
          <p>StyleIQ is the system our human stylists use to understand what actually suits you.</p>
          <p>Your stylist reviews your photos, measurements, build, coloring, lifestyle, preferences, and budget, then turns those details into practical recommendations built around you.</p>
        </div>
        <div className="styleiq-subsections" aria-label="StyleIQ review inputs">
          {styleIqPillars.map((pillar, index) => (
            <Fragment key={pillar.title}>
              {index === 0 && (
                <figure className="styleiq-overview-image">
                  <img
                    src="https://res.cloudinary.com/dm49wi6j4/image/upload/f_auto,q_auto,c_limit,w_1000/v1787999365/ChatGPT_Image_Aug_29_2026_03_57_39_PM_1_adbvxg.webp"
                    alt="StyleIQ system overview"
                    loading="lazy"
                    decoding="async"
                    width="1000"
                    height="563"
                  />
                </figure>
              )}
              {index === 1 && (
                <figure className="styleiq-overview-image">
                  <img
                    src="https://res.cloudinary.com/dm49wi6j4/image/upload/f_auto,q_auto,c_limit,w_1000/v1787999365/ChatGPT_Image_Aug_29_2026_03_57_39_PM_2_vc4kcu.webp"
                    alt="Build and proportions styling"
                    loading="lazy"
                    decoding="async"
                    width="1000"
                    height="563"
                  />
                </figure>
              )}
              {index === 2 && (
                <figure className="styleiq-overview-image">
                  <img
                    src="https://res.cloudinary.com/dm49wi6j4/image/upload/f_auto,q_auto,c_limit,w_1000/v1787999365/ChatGPT_Image_Aug_29_2026_03_57_40_PM_3_uailwn.webp"
                    alt="Personal coloring guide"
                    loading="lazy"
                    decoding="async"
                    width="1000"
                    height="563"
                  />
                </figure>
              )}
              {index === 3 && (
                <figure className="styleiq-overview-image">
                  <img
                    src="https://res.cloudinary.com/dm49wi6j4/image/upload/f_auto,q_auto,c_limit,w_1000/v1787999365/ChatGPT_Image_Aug_29_2026_03_57_41_PM_5_cqgesu.webp"
                    alt="Lifestyle styling guide"
                    loading="lazy"
                    decoding="async"
                    width="1000"
                    height="563"
                  />
                </figure>
              )}
              {index === 4 && (
                <figure className="styleiq-overview-image">
                  <img
                    src="https://res.cloudinary.com/dm49wi6j4/image/upload/f_auto,q_auto,c_limit,w_1000/v1787999365/ChatGPT_Image_Aug_29_2026_03_57_41_PM_4_dbups8.webp"
                    alt="Preferences and budget guide"
                    loading="lazy"
                    decoding="async"
                    width="1000"
                    height="563"
                  />
                </figure>
              )}
              <article className="styleiq-subsection" key={pillar.title}>
                <div className="styleiq-subsection-heading">
                  <small>{String(index + 1).padStart(2, "0")}</small>
                  <h3>{pillar.title}</h3>
                </div>
                <p>{pillar.description}</p>
              </article>
            </Fragment>
          ))}
        </div>
        <p className="styleiq-judgment">StyleIQ gives your stylist the system. Your stylist gives you the judgment.</p>
      </div>
    </section>
  );
}

export function ComparisonSection() {
  return (
    <section className="section comparison-section section-editorial-preview comparison-editorial">
      <div className="shell">
        <SectionHeading>
          Without StyleIQ <span>vs. With StyleIQ</span>
        </SectionHeading>
        <div className="copy-stack comparison-copy">
          <p>See what changes when the advice is built around your features, proportions, lifestyle, and budget.</p>
        </div>
        <figure className="comparison-overview-image">
          <img
            src="https://res.cloudinary.com/dm49wi6j4/image/upload/f_auto,q_auto,c_limit,w_900/v1788000316/ChatGPT_Image_Aug_29_2026_04_14_20_PM_1_a6bo6i.webp"
            alt="StyleIQ comparison overview"
            loading="lazy"
            decoding="async"
            width="900"
            height="900"
          />
        </figure>
        <div className="comparison-subsections" aria-label="Without StyleIQ and With StyleIQ comparison">
          <article className="comparison-subsection comparison-subsection-without">
            <div className="comparison-subsection-heading">
              <h3>Without StyleIQ</h3>
            </div>
            <ul className="comparison-subsection-list">
              {comparisonRows.map((row) => (
                <li key={row.withoutStyleIq}><X size={18} weight="bold" aria-hidden="true" /><span>{row.withoutStyleIq}</span></li>
              ))}
            </ul>
          </article>
          <article className="comparison-subsection comparison-subsection-with">
            <div className="comparison-subsection-heading comparison-with-heading">
              <figure className="comparison-with-image">
                <img
                  src="https://res.cloudinary.com/dm49wi6j4/image/upload/f_auto,q_auto,c_limit,w_900/v1788000316/ChatGPT_Image_Aug_29_2026_04_14_21_PM_2_nbdoi9.webp"
                  alt="With StyleIQ benefits"
                  loading="lazy"
                  decoding="async"
                  width="900"
                  height="900"
                />
              </figure>
              <h3>With StyleIQ</h3>
            </div>
            <ul className="comparison-subsection-list">
              {comparisonRows.map((row) => (
                <li key={row.withStyleIq}><Check size={18} weight="bold" aria-hidden="true" /><span>{row.withStyleIq}</span></li>
              ))}
            </ul>
          </article>
        </div>
      </div>
    </section>
  );
}

export function ReportContents() {
  return (
    <section className="section report-contents section-editorial-preview report-contents-editorial" id="inside">
      <div className="shell">
        <SectionHeading>
          Everything You Get <span>With StyleIQ</span>
        </SectionHeading>
        <div className="copy-stack report-contents-copy">
          <p>One personalized system for what to wear, how to groom, what to buy, and what to do next.</p>
        </div>
        <div className="report-content-subsections" aria-label="Everything included in your StyleIQ report">
          {reportContentGroups.map((group, index) => (
            <Fragment key={group.title}>
              {index === 0 && (
                <SoundVideo
                  className="report-overview-video"
                  src="https://res.cloudinary.com/dhjsqmejb/video/upload/v1787990480/Style_Report_overview_2_sm1mmx.mp4"
                  label="StyleIQ report overview video"
                />
              )}
              <article className="report-content-subsection" key={group.title}>
                <div className="report-content-subsection-heading">
                  <small>{String(index + 1).padStart(2, "0")}</small>
                  <h3>{group.title}</h3>
                </div>
                <div className="report-content-subsection-body">
                  <p>{group.intro}</p>
                  <ul>
                    {group.items.map((item) => (
                      <li key={item}><Check size={16} weight="bold" /><span>{item}</span></li>
                    ))}
                  </ul>
                </div>
              </article>
            </Fragment>
          ))}
        </div>
      </div>
    </section>
  );
}

export function BonusesSection() {
  return (
    <section className="section bonuses-section section-editorial-preview bonuses-editorial">
      <div className="shell">
        <SectionHeading>
          Plus 2 <span>Bonuses</span>
        </SectionHeading>
        <div className="bonus-subsections" aria-label="StyleIQ bonuses">
          {bonuses.map((bonus, index) => {
            const bonusTitle = bonus.title.replace(/^Bonus #\d+ - /, "");

            return (
              <article className="bonus-subsection" key={bonus.title}>
                <div className="bonus-subsection-heading">
                  <small>{String(index + 1).padStart(2, "0")}</small>
                  <h3>{bonusTitle}</h3>
                </div>
                <div className="bonus-subsection-body">
                  <p>{bonus.description}</p>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function ProcessSection() {
  return (
    <section className="section process section-editorial-preview process-editorial" id="process">
      <div className="shell process-shell">
        <SectionHeading>
          Getting Your StyleIQ Report <span>Is Simple</span>
        </SectionHeading>
        <div className="copy-stack process-copy">
          <p>No appointments. No travel. No waiting weeks for a styling consultation.</p>
        </div>
        <div className="process-flow" aria-label="How StyleIQ report delivery works">
          {processSteps.map((step, index) => (
            <article className="process-step" key={step.number} aria-label={`${step.number}: ${step.title}`}>
              <div className="process-step-heading">
                <span>{String(index + 1).padStart(2, "0")}</span>
                <h3>{step.title}</h3>
              </div>
              <figure>
                <img
                  src={step.image}
                  alt={step.alt}
                  loading="lazy"
                  decoding="async"
                  width={step.imageWidth}
                  height={step.imageHeight}
                />
              </figure>
              <p className="process-description">{step.description}</p>
            </article>
          ))}
        </div>
        <div className="process-action">
          <Button>Start My StyleIQ</Button>
          <p className="process-note">Your complete StyleIQ arrives within 48 hours after we receive your assessment.</p>
        </div>
      </div>
    </section>
  );
}

export function RecapSection() {
  return (
    <section className="section final-recap final-offer-section section-editorial-preview" id="purchase">
      <div className="shell">
        <SectionHeading>
          150+ personal style decisions <span>already made easier</span> for you
        </SectionHeading>
        <div className="final-offer styleiq-final-offer">
          <p>One stylist. One analysis. One complete direction for how you look.</p>
          <div className="recap-grid">
            {recapItems.map((item) => (
              <span key={item}><Check size={15} weight="bold" /> {item}</span>
            ))}
          </div>
          <div className="price-line" aria-label="StyleIQ final price">
            <span>Today&apos;s Price</span>
            <strong>{PRICE_LABEL}</strong>
            <small>One-time payment</small>
          </div>
          <Button className="final-offer-button" showIcon={false}>Get My Personal Style Report</Button>
          <div className="delivery-proof" aria-label="Delivery and access details">
            <span><ClockCountdown size={26} weight="regular" /> Delivered within 48 hours</span>
            <span><SealCheck size={26} weight="regular" /> Lifetime access included</span>
          </div>
        </div>
      </div>
    </section>
  );
}
