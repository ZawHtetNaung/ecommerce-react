import StorefrontHeader from '../components/StorefrontHeader';

const policySections = [
  { id: 'who-we-are', label: 'Who we are', number: '01' },
  { id: 'website-terms', label: 'Website terms', number: '02' },
  { id: 'google-data', label: 'Google user data', number: '03' },
  { id: 'orders', label: 'Orders', number: '04' },
  { id: 'prices', label: 'Prices', number: '05' },
  { id: 'delivery', label: 'Delivery', number: '06' },
  { id: 'cookies', label: 'Cookies', number: '07' },
  { id: 'returns', label: 'Returns & refunds', number: '08' },
  { id: 'installation', label: 'Installation', number: '09' },
];

const deliveryGroups = [
  {
    title: 'Furniture',
    timing: 'Within 2 days',
    lines: ['Free delivery in Sharjah and Dubai', 'AED 500 delivery fee for other Emirates'],
  },
  {
    title: 'Wallcovering',
    timing: 'Within 2 days',
    lines: ['Free delivery in Sharjah and Dubai', 'AED 50 delivery fee for other Emirates'],
  },
  {
    title: 'Flooring',
    timing: 'Within 7 days',
    lines: ['Free delivery in Sharjah and Dubai', 'AED 500 delivery fee for other Emirates'],
  },
];

export default function PrivacyPolicyPage() {
  return (
    <div className="storefront-page privacy-policy-page">
      <StorefrontHeader />

      <main className="privacy-policy-shell">
        <section className="privacy-policy-hero">
          <div className="privacy-policy-hero-copy">
            <span className="store-eyebrow">Customer care &amp; transparency</span>
            <h1>Privacy policy<br />&amp; website terms.</h1>
            <p>
              Clear information about how Messara Living operates this website,
              processes orders, handles account data, and supports purchases across the UAE.
            </p>
            <div className="privacy-policy-hero-meta">
              <span>Messara Trading LLC</span>
              <span>United Arab Emirates</span>
              <span>Commercial licence 112058</span>
            </div>
          </div>

          <div className="privacy-policy-hero-mark" aria-hidden="true">
            <svg viewBox="0 0 120 120">
              <path d="M60 12 96 26v27c0 25-14 43-36 55-22-12-36-30-36-55V26l36-14Z" />
              <path d="m44 59 11 11 23-25" />
            </svg>
            <span>Your trust,<br />handled carefully.</span>
          </div>
        </section>

        <div className="privacy-policy-layout">
          <aside className="privacy-policy-nav" aria-label="Privacy policy contents">
            <span>On this page</span>
            <nav>
              {policySections.map((section) => (
                <a href={`#${section.id}`} key={section.id}>
                  <small>{section.number}</small>
                  <strong>{section.label}</strong>
                </a>
              ))}
            </nav>
            <div className="privacy-policy-help">
              <strong>Need clarification?</strong>
              <p>Our team can help with an order, delivery, installation, or policy question.</p>
              <a href="mailto:hello@messaraliving.com">hello@messaraliving.com</a>
            </div>
          </aside>

          <article className="privacy-policy-content">
            <section className="privacy-policy-section" id="who-we-are">
              <PolicyHeading number="01" title="Who we are" />
              <p>
                Welcome to Messara Living, your luxury companion. We aim to provide an effortless
                shopping experience and hope you enjoy everything our website has to offer.
              </p>
              <p>
                <strong>messaraliving.com</strong> (the “Website”) is owned and operated by
                Messara Trading LLC as Messara Living, for its own benefit and the benefit of its
                affiliates and subsidiaries (together “we” or “us”) in the United Arab Emirates.
              </p>
              <div className="privacy-policy-fact-grid">
                <div><span>Legal entity</span><strong>Messara Trading LLC</strong></div>
                <div><span>Commercial licence</span><strong>112058</strong></div>
                <div><span>Registered office</span><strong>PO Box 22478, Sharjah, UAE</strong></div>
              </div>
            </section>

            <section className="privacy-policy-section" id="website-terms">
              <PolicyHeading number="02" title="Website terms" />
              <p>
                This policy and any other terms of use posted on the Website together form our
                Website Terms. They govern your use of the Website and its services, including
                the Website call centre and mobile application where available.
              </p>
              <p>
                We may update these terms by publishing a revised version on the Website, so you
                should check them regularly. When you place an order, you accept the latest version
                posted at that time. A later change required by law may apply before fulfilment;
                otherwise, the version in place when your order was made will apply.
              </p>
              <div className="privacy-policy-note">
                <strong>Using this website means accepting these terms.</strong>
                <span>If you do not agree to them, you should not use the Website.</span>
              </div>
            </section>

            <section className="privacy-policy-section" id="google-data">
              <PolicyHeading number="03" title="Use of Google user data" />
              <p>
                Where Google sign-in is available, Messara Living uses Google OAuth to let users
                sign in securely. We collect basic profile data, including name and email address,
                only after explicit consent.
              </p>
              <p>
                This information is used to personalise your experience and provide access to our
                services. We do not share Google user data with third parties and follow Google’s
                API Services User Data Policy, including its Limited Use requirements.
              </p>
              <div className="privacy-policy-links">
                <a href="https://myaccount.google.com/permissions" target="_blank" rel="noreferrer">Review Google account access <span>↗</span></a>
                <a href="https://developers.google.com/terms/api-services-user-data-policy" target="_blank" rel="noreferrer">Google user data policy <span>↗</span></a>
              </div>
              <p>
                You may revoke access through your Google Account permissions. To request deletion
                of your data, contact <a href="mailto:hello@messaraliving.com">hello@messaraliving.com</a>.
              </p>
            </section>

            <section className="privacy-policy-section" id="orders">
              <PolicyHeading number="04" title="Orders" />
              <p>
                When you place an order, subject to your cancellation and return rights, you commit
                to purchase the items described at the indicated price, including applicable
                delivery fees, taxes, and duties.
              </p>
              <ul className="privacy-policy-list">
                <li>Orders remain subject to our acceptance and to product availability.</li>
                <li>We may withhold acceptance due to ineligibility, payment authorisation, suspected fraud, shipping restrictions, or stock availability.</li>
                <li>Items in your basket are not reserved until the order is paid.</li>
                <li>Product colours may appear slightly different in person.</li>
                <li>An order confirmation will be sent by email.</li>
                <li>Installation and fixing are not included unless requested separately.</li>
              </ul>
            </section>

            <section className="privacy-policy-section" id="prices">
              <PolicyHeading number="05" title="Prices" />
              <p>
                Website prices are shown in AED and exclude optional services, delivery costs,
                taxes, or duties that may apply. Additional costs will be displayed before final
                checkout. A card issued in another currency will use the exchange rate applied by
                the card issuer when payment is completed.
              </p>
              <p>
                Charges depend on the delivery destination, selected items and services, and the
                chosen delivery method. Although we work to keep displayed prices accurate, errors
                may occur; please contact us if you notice one.
              </p>
              <div className="privacy-policy-price-note">
                <span>VAT</span>
                <strong>5%</strong>
                <p>
                  Standard taxable products receive 5% VAT at checkout. Products marked as
                  VAT-inclusive keep their displayed price and show the embedded 5% VAT amount
                  separately. Products marked as no tax do not show or receive VAT.
                </p>
              </div>
            </section>

            <section className="privacy-policy-section" id="delivery">
              <PolicyHeading number="06" title="Delivery across the UAE" />
              <div className="privacy-delivery-grid">
                {deliveryGroups.map((group) => (
                  <article key={group.title}>
                    <span>{group.timing}</span>
                    <h3>{group.title}</h3>
                    {group.lines.map((line) => <p key={line}>{line}</p>)}
                  </article>
                ))}
              </div>
              <div className="privacy-policy-note is-neutral">
                <strong>Scheduling &amp; availability</strong>
                <span>
                  Our team will contact you to arrange delivery. Timelines may be affected by
                  holidays and stock availability.
                </span>
              </div>
            </section>

            <section className="privacy-policy-section" id="cookies">
              <PolicyHeading number="07" title="Cookies & account settings" />
              <p>
                Where commenting is available, you may choose to save your name, email address, and
                website in cookies for convenience. These cookies remain for one year.
              </p>
              <ul className="privacy-policy-list">
                <li>A temporary login cookie checks whether your browser accepts cookies. It contains no personal data and is removed when the browser closes.</li>
                <li>Login cookies last for two days, while screen preference cookies last for one year.</li>
                <li>Selecting “Remember Me” keeps your login for two weeks. Logging out removes the login cookies.</li>
                <li>Where article editing is available, an editing cookie stores only the post ID, contains no personal data, and expires after one day.</li>
              </ul>
            </section>

            <section className="privacy-policy-section" id="returns">
              <PolicyHeading number="08" title="Returns, exchanges & refunds" />
              <p>
                Subject to the conditions below and inspection by our specialised team, eligible
                delivered items may be returned within 14 days of delivery.
              </p>
              <div className="privacy-policy-split">
                <div>
                  <span>Returns</span>
                  <ul>
                    <li>A wrong colour or wrong item was delivered.</li>
                    <li>The item has a factory defect or was damaged during installation or delivery.</li>
                    <li>Flooring cannot be returned after its box has been opened.</li>
                    <li>Wallcovering cannot be returned after its roll has been opened.</li>
                  </ul>
                </div>
                <div>
                  <span>Exchanges</span>
                  <ul>
                    <li>Items may be exchanged when they are new, unused, and undamaged.</li>
                  </ul>
                  <span>Refunds</span>
                  <ul>
                    <li>The full amount, including delivery, is refunded for a wrong item, factory defect, or delivery damage.</li>
                    <li>The full amount is refunded when an order is cancelled before delivery.</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="privacy-policy-section" id="installation">
              <PolicyHeading number="09" title="Installation" />
              <ul className="privacy-policy-list">
                <li>Installation is not included in the item price.</li>
                <li>The installation requirement and price are determined by our specialised team after a site visit.</li>
                <li>Installation is completed by our specialised team after a request is confirmed.</li>
                <li>Our representative will contact you to schedule the site visit.</li>
              </ul>
              <div className="privacy-policy-contact-band">
                <div>
                  <span>Questions about this policy?</span>
                  <h2>We’re here to make the details clear.</h2>
                </div>
                <a href="mailto:hello@messaraliving.com">Contact Messara Living <span>→</span></a>
              </div>
            </section>
          </article>
        </div>
      </main>
    </div>
  );
}

function PolicyHeading({ number, title }) {
  return (
    <header className="privacy-policy-heading">
      <span>{number}</span>
      <h2>{title}</h2>
    </header>
  );
}
