import "../styles/legal.css";

const COMPANY_NAME = "DYN PRODUCTIVITY SEMPRE PRIVATE LIMITED";
const SUPPORT_EMAIL = "attractivemen08@gmail.com";
const COMPANY_ADDRESS = [
  "C-137, Sector 10",
  "Noida, Gautam Budh Nagar",
  "Uttar Pradesh 201301, India",
];

const pageContent = {
  privacy: {
    eyebrow: "Privacy Policy",
    title: "Privacy Policy",
    updated: "Last updated: July 26, 2026",
    intro:
      "This Privacy Policy explains how AttractiveMen collects, uses, stores, and protects information shared with us when you purchase or use our personalized style report service.",
    sections: [
      {
        title: "Information We Collect",
        body: [
          "We may collect your name, email address, phone number, city, payment status, order details, body details, styling preferences, uploaded photos, and any information you provide while completing the style assessment.",
          "We also collect basic technical information such as browser type, device information, pages visited, and timestamps to keep the website secure and improve the checkout experience.",
        ],
      },
      {
        title: "How We Use Your Information",
        body: [
          "We use your information to create and deliver your personalized style report, contact you about your order, provide support, improve our recommendations, process payments, prevent misuse, and comply with legal obligations.",
          "Your photos and personal measurements are used only for style analysis, report preparation, quality checks, and customer support related to your order.",
        ],
      },
      {
        title: "Photos And Sensitive Details",
        body: [
          "Because our service depends on face shape, body type, and skin tone analysis, you may be asked to share photos and body-related information. We treat this information as private and restrict access to people who need it to prepare or support your report.",
          "Please avoid uploading documents or images that are not required for your style assessment.",
        ],
      },
      {
        title: "Payments",
        body: [
          "Payments may be processed through third-party payment providers. We do not store your card, UPI, netbanking, or wallet credentials on our website.",
          "Payment providers may collect and process payment information under their own policies and security standards.",
        ],
      },
      {
        title: "Analytics, Cookies, And Ads",
        body: [
          "We may use Meta Pixel and Microsoft Clarity to understand page visits, checkout behavior, ad attribution, and website performance.",
          "These tools may use cookies and local storage, collect device and browser information, and create session recordings or heatmaps. We do not intentionally send raw payment credentials to these analytics tools.",
        ],
      },
      {
        title: "Sharing Of Information",
        body: [
          "We do not sell your personal information. We may share limited information with service providers who help us operate the website, process payments, deliver reports, manage customer support, or meet legal requirements.",
          "If required by law, court order, government request, fraud prevention process, or business transfer, we may disclose relevant information in a lawful and proportionate manner.",
        ],
      },
      {
        title: "Data Retention",
        body: [
          "We keep order and support records for as long as needed to provide the service, resolve disputes, meet accounting requirements, and comply with applicable law.",
          "Photos and assessment details are retained only for legitimate business needs such as report delivery, revisions, support, and quality improvement, unless a longer period is required by law.",
        ],
      },
      {
        title: "Your Choices",
        body: [
          "You may contact us to request access, correction, or deletion of personal information where applicable. Some records may need to be retained for legal, tax, payment, dispute, or fraud prevention reasons.",
          `For privacy requests, email us at ${SUPPORT_EMAIL}.`,
        ],
      },
      {
        title: "Contact",
        body: [
          `For questions about this Privacy Policy, contact ${COMPANY_NAME} at ${SUPPORT_EMAIL}.`,
          "Support Hours: Monday - Friday, 9:00 AM - 6:00 PM IST",
        ],
      },
    ],
  },
  terms: {
    eyebrow: "Terms & Conditions",
    title: "Terms & Conditions",
    updated: "Last updated: July 26, 2026",
    intro:
      "These Terms & Conditions govern your access to and use of AttractiveMen, including the purchase and delivery of personalized style reports and related services.",
    sections: [
      {
        title: "About AttractiveMen",
        body: [
          `AttractiveMen is operated by ${COMPANY_NAME}. We provide personalized style guidance based on information you submit, including photos, measurements, preferences, and assessment answers.`,
          "Our recommendations are styling, grooming, wardrobe, and appearance guidance. They are not medical, dermatological, psychological, financial, or legal advice.",
        ],
      },
      {
        title: "Eligibility And Account Information",
        body: [
          "By placing an order, you confirm that the information you provide is accurate and that you are legally able to enter into this agreement.",
          "You are responsible for ensuring that the photos, measurements, and preferences you submit are clear, current, and suitable for analysis.",
        ],
      },
      {
        title: "Orders, Pricing, And Payment",
        body: [
          "The displayed price for the AttractiveMen Personalized Style Report is INR 1,999 plus applicable GST, unless a different price is clearly shown at checkout.",
          "Your order is confirmed only after successful payment. Taxes, payment gateway charges, or other lawful charges may apply where shown during checkout.",
        ],
      },
      {
        title: "Delivery",
        body: [
          "We aim to deliver your report within 48 hours after receiving your completed assessment and all required photos or details.",
          "Delivery timelines may change if your submission is incomplete, unclear, delayed, or requires clarification from our team.",
        ],
      },
      {
        title: "Revisions And Support",
        body: [
          "If something in your report appears unclear or incorrect, contact us with your order details so we can review the issue.",
          `Support is available Monday - Friday, 9:00 AM - 6:00 PM IST at ${SUPPORT_EMAIL}.`,
        ],
      },
      {
        title: "Refunds And Cancellations",
        body: [
          "Because personalized reports involve manual review and customized analysis, cancellation or refund requests may not be possible once work has started on your order.",
          "If you paid but did not receive your report, or if there is a payment error, contact us and we will review the issue fairly based on order status and delivery records.",
        ],
      },
      {
        title: "Use Of The Report",
        body: [
          "Your report is created for your personal use. You may not resell, redistribute, copy, publish, or commercially exploit the report without written permission from us.",
          "Results vary based on your submitted information, grooming choices, wardrobe availability, budget, execution, lighting, photography, and personal preferences.",
        ],
      },
      {
        title: "Limitation Of Liability",
        body: [
          "We work to provide practical and personalized style guidance, but we do not guarantee compliments, job outcomes, relationship outcomes, appearance changes, or any specific personal result.",
          "To the maximum extent permitted by law, our liability is limited to the amount paid for the specific service giving rise to the claim.",
        ],
      },
      {
        title: "Contact And Legal Entity",
        body: [
          COMPANY_NAME,
          ...COMPANY_ADDRESS,
          `Email: ${SUPPORT_EMAIL}`,
          "Support Hours: Monday - Friday, 9:00 AM - 6:00 PM IST",
        ],
      },
    ],
  },
};

export function LegalPage({ type = "privacy" }) {
  const content = pageContent[type] ?? pageContent.privacy;

  return (
    <main className="legal-page">
      <header className="legal-hero">
        <a className="legal-brand" href="/" aria-label="AttractiveMen home">
          AttractiveMen
        </a>
        <p>{content.eyebrow}</p>
        <h1>{content.title}</h1>
        <span>{content.updated}</span>
      </header>
      <article className="legal-shell">
        <p className="legal-intro">{content.intro}</p>
        {content.sections.map((section) => (
          <section className="legal-section" key={section.title}>
            <h2>{section.title}</h2>
            {section.body.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </section>
        ))}
        <section className="legal-contact-card" aria-label="Company contact details">
          <h2>Company Details</h2>
          <p><strong>{COMPANY_NAME}</strong></p>
          {COMPANY_ADDRESS.map((line) => (
            <p key={line}>{line}</p>
          ))}
          <p><a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a></p>
          <p>Support Hours: Monday - Friday, 9:00 AM - 6:00 PM IST</p>
        </section>
      </article>
    </main>
  );
}
