import { transformationPersonas } from "../../lib/landing-data.js";
import { SectionHeading, SoundVideo } from "./shared.jsx";

function YouFirstTransformationStack() {
  return (
    <div className="you-first-transformation-stack" aria-label="Personal style transformation examples">
      {transformationPersonas.map((persona, index) => (
        <article className="you-first-transformation-item" key={persona.title}>
          <div className="you-first-transformation-persona">
            {index === 0 ? (
              <p>
                Look at this <b>40 year old man</b>, he <b>looks stylish and almost 5 years younger</b>.
              </p>
            ) : index === 1 ? (
              <p>This <strong>{persona.title}</strong>&nbsp;{persona.outcome}</p>
            ) : index === 2 ? (
              <p>This <strong>{persona.title}</strong> found the <strong>{persona.outcome}</strong></p>
            ) : index === 3 ? (
              <p>We did the <strong>{persona.title}</strong> and <strong>{persona.outcome}</strong></p>
            ) : (
              <p><strong>{persona.title}</strong> - {persona.outcome}</p>
            )}
          </div>
          <figure className="you-first-transformation-frame">
            <img
              src={persona.image}
              alt={`Before and after personal style transformation for ${persona.title}`}
              loading="lazy"
              decoding="async"
              width={persona.imageWidth}
              height={persona.imageHeight}
            />
            <div className="you-first-transformation-divider" aria-hidden="true" />
            <span className="you-first-transformation-label you-first-transformation-label-before">Before</span>
            <span className="you-first-transformation-label you-first-transformation-label-after">After</span>
          </figure>
        </article>
      ))}
    </div>
  );
}

export function ProblemSection() {
  return (
    <section className="section problem section-editorial-preview problem-editorial" id="problem">
      <div className="shell narrow-shell">
        <SoundVideo
          className="problem-header-video"
          src="https://res.cloudinary.com/dm49wi6j4/video/upload/v1788007305/grooming_silence_edit_final_1_m4w53i.mp4"
          label="Grooming and style direction video"
        />
        <figure className="problem-header-image">
          <img
            src="https://res.cloudinary.com/dm49wi6j4/image/upload/f_auto,q_auto,c_limit,w_760/v1788003564/ChatGPT_Image_Aug_29_2026_05_06_07_PM_bf2kfj.webp"
            alt="Internet fashion advice"
            loading="lazy"
            decoding="async"
            width="760"
            height="1404"
          />
        </figure>
        <SectionHeading>
          THE INTERNET IS FULL OF <span>RANDOM FASHION ADVICE</span>
        </SectionHeading>
        <div className="problem-copy">
          <p className="problem-intro">And somehow, figuring out what you should actually wear is still a mystery.</p>
          <figure className="problem-visual problem-visual-expanded">
            <img
              src="https://res.cloudinary.com/dm49wi6j4/image/upload/f_auto,q_auto,c_limit,w_1000/v1787994025/internet-random-advice_cht9si.webp"
              alt="Random fashion advice on the internet"
              loading="lazy"
              decoding="async"
              width="1000"
              height="563"
            />
          </figure>
          <p>You copy a <strong className="problem-emphasis problem-emphasis-caps">haircut</strong> that looked great on someone else.</p>
          <p>You save an outfit from <em className="problem-emphasis problem-emphasis-caps problem-emphasis-italic">Instagram</em>.</p>
          <p>You buy the <strong className="problem-emphasis problem-emphasis-caps">trousers</strong> every man is supposed to own.</p>
          <p>Sometimes it <strong className="problem-emphasis problem-emphasis-caps">works</strong>.</p>
          <p>Sometimes it looks <span className="problem-emphasis problem-emphasis-caps problem-emphasis-underlined">terrible</span>.</p>
          <ul className="problem-bullets">
            <li><span>Will this suit my face?</span></li>
            <li><span>Will this fit my build?</span></li>
            <li><span>Will this color suit my complexion?</span></li>
            <li><span>What should I buy next?</span></li>
          </ul>
          <figure className="problem-visual">
            <img
              src="/assets/problem/reel-vs-real.webp"
              alt="The same outfit looking suitable in a Reel but poorly fitted in real life"
              loading="lazy"
              decoding="async"
              width="750"
              height="680"
            />
          </figure>
          <p className="problem-kicker">Most style advice tells you <span className="problem-emphasis problem-emphasis-caps problem-emphasis-underlined">what looks good</span>.</p>
          <p className="problem-kicker">It does not tell you <strong className="problem-emphasis problem-emphasis-caps">what looks good on you</strong>.</p>
        </div>
      </div>
    </section>
  );
}

export function WasteSection() {
  return (
    <section className="section waste-section section-editorial-preview waste-editorial">
      <div className="shell narrow-shell">
        <SectionHeading>
          Stop wasting money on the <span>wrong clothes</span>
        </SectionHeading>
        <div className="copy-stack waste-copy">
          <p>We know, not because every purchase is expensive.</p>
          <p>But most of them start collecting dust because the <strong className="waste-emphasis waste-emphasis-caps">shirt</strong> you liked in the store but rarely wear.</p>
          <p>The <strong className="waste-emphasis waste-emphasis-caps">trousers</strong> that technically fit but never look like a good fit on you</p>
          <figure className="waste-visual">
            <img
              src="https://res.cloudinary.com/dm49wi6j4/image/upload/f_auto,q_auto,c_limit,w_760/v1787996066/ChatGPT_Image_Aug_29_2026_03_03_27_PM_jd4kve.webp"
              alt="Wardrobe dilemma"
              loading="lazy"
              decoding="async"
              width="760"
              height="1013"
            />
          </figure>
          <p>No matter how many hairstyles, color combinations, and shoes you tried, still today, when you open your wardrobe before work, a date, or an event, you&apos;re still thinking:</p>
          <p><strong className="waste-emphasis waste-emphasis-caps waste-emphasis-underlined">&ldquo;What the hell do I wear?&rdquo;</strong></p>
          <p>There&rsquo;s a simple solution: you don&rsquo;t need more <span className="waste-emphasis waste-emphasis-caps">trial and error</span>; you need <strong className="waste-emphasis waste-emphasis-underlined">better decisions</strong> about the clothes, grooming, and style choices you already make.</p>
        </div>
      </div>
    </section>
  );
}

export function YouFirstSection() {
  return (
    <section className="section you-first-section section-editorial-preview you-first-editorial">
      <div className="shell narrow-shell">
        <SectionHeading>
          You&rsquo;ve been trying to solve a <span>personal</span> problem with <span>generic</span> answers.
        </SectionHeading>
        <div className="copy-stack you-first-copy">
          <p>Most style advice starts with a Reel of a YouTube Video saying:</p>
          <div className="you-first-quote-stack">
            <p>&ldquo;Buy this.&rdquo;</p>
            <p>&ldquo;Wear that.&rdquo;</p>
            <p>&ldquo;Get this haircut.&rdquo;</p>
          </div>
          <p>But good styling starts with <strong className="you-first-emphasis you-first-emphasis-underlined">you</strong>.</p>
          <YouFirstTransformationStack />
          <div className="you-first-feature-stack">
            <p>Your features.</p>
            <p>Your proportions.</p>
            <p>Your coloring.</p>
            <p>Your lifestyle, taste, and budget.</p>
          </div>
          <p>All these things matter because without that context, you&rsquo;re just guessing what might work.</p>
          <p>With it, choosing what to wear becomes much easier.</p>
        </div>
      </div>
    </section>
  );
}

export function ProfessionalStylingSection() {
  return (
    <section className="section professional-styling-section section-editorial-preview professional-styling-editorial">
      <div className="shell narrow-shell">
        <SectionHeading>
          Professional Styling Starts With <span>YOU</span>.
        </SectionHeading>
        <div className="copy-stack professional-styling-copy">
          <p>Famous celebrities rely on personal styling all the time.</p>
          <p>It commonly considers factors such as <strong className="professional-styling-emphasis">face and body</strong> <strong className="professional-styling-emphasis">proportions, coloring, silhouettes, wardrobe needs, lifestyle, and occasion</strong> before making recommendations.</p>
          <figure className="professional-styling-visual">
            <img
              src="https://res.cloudinary.com/dm49wi6j4/image/upload/f_auto,q_auto,c_limit,w_760/v1787997317/ChatGPT_Image_Aug_29_2026_03_24_27_PM_pgk0dk.webp"
              alt="Professional styling factors"
              loading="lazy"
              decoding="async"
              width="760"
              height="1350"
            />
          </figure>
          <p>That makes sense because.</p>
          <div className="professional-styling-reason-stack">
            <p>A haircut cannot be judged only by whether it is fashionable.</p>
            <p>A color cannot be judged only by whether it is trending.</p>
            <p>A jacket cannot be judged only by whether it looks good on the model.</p>
          </div>
          <p><strong className="professional-styling-emphasis professional-styling-emphasis-underlined">Personalized styling solves all these issues.</strong></p>
          <p>Because of this, all the celebrities pay lakhs of rupees to look stylish, but you don&rsquo;t have to.</p>
          <p>The StyleIQ is built to provide your unique, personalized makeover but completely within your budget.</p>
        </div>
      </div>
    </section>
  );
}
