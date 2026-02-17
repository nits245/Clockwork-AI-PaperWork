import React, { useState } from "react";
import "./Policy.scss";

const Policy: React.FC = () => {
  // Always defaults to "overview" on refresh
  const [activeId, setActiveId] = useState("overview");

  const tocItems = [
    { id: "overview", label: "Privacy policy overview" },
    { id: "info-collect", label: "Information we collect" },
    { id: "info-use", label: "How we use information" },
    { id: "info-disclose", label: "How we disclose information" },
    { id: "store", label: "How we store and secure information" },
    { id: "retention", label: "How long we keep information" },
    { id: "access", label: "How to access and control your information" },
    { id: "children", label: "Our policy towards children" },
    { id: "regional", label: "Regional disclosures" },
    { id: "changes", label: "Changes to our privacy policy" },
    { id: "contact", label: "How to contact us" },
  ];

  return (
    <div className="policy-wrapper">
      <div className="policy-layout">
        {/* Table of Contents on left */}
        <nav className="policy-toc" aria-label="Table of Contents">
          <h3>Privacy Policy</h3>
          <ul>
            {tocItems.map((item) => (
              <li
                key={item.id}
                className={activeId === item.id ? "active" : ""}
              >
                <a
                  href={`#${item.id}`}
                  onClick={() => setActiveId(item.id)} // Only highlights clicked one
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* Main Content */}
        <main className="policy-content">
          <section id="overview">
            <h1>Privacy Policy</h1>
            <p>
              <em>Effective starting: October 7, 2025</em>
            </p>
            <p>
              Your privacy matters to us. This Privacy Policy explains how we
              collect, use, share, and protect your information when you use our
              services. Lorem ipsum dolor sit amet, consectetur adipiscing elit.
              Curabitur at nisl nec libero scelerisque aliquet in non magna.
              Vivamus eu dui id magna varius ullamcorper.
            </p>
          </section>

          <section id="info-collect">
            <h2>Information we collect</h2>
            <p>
              We collect information you provide directly, such as when you
              create an account, fill in a form, or contact support. This may
              include your name, email, phone number, and company details.
            </p>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris
              feugiat, turpis nec fermentum viverra, est velit bibendum sem, ut
              egestas mi felis a ante. Donec dapibus arcu sit amet magna
              facilisis accumsan.
            </p>
          </section>

          <section id="info-use">
            <h2>How we use information</h2>
            <p>
              The information we collect is used to provide, maintain, and
              improve our services. This includes personalizing your experience,
              ensuring security, and communicating updates.
            </p>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer
              porttitor sem a lorem sagittis, vel egestas erat faucibus. Donec
              volutpat diam et nulla eleifend, ac suscipit lorem dapibus.
            </p>
          </section>

          <section id="info-disclose">
            <h2>How we disclose information</h2>
            <p>
              We do not sell your personal information. We may share it with
              trusted third-party service providers who help us deliver our
              services.
            </p>
            <p>
              Curabitur mattis nunc at purus dictum, vel hendrerit neque
              malesuada. Ut at varius enim, et suscipit ex. Vivamus in sagittis
              lectus.
            </p>
          </section>

          <section id="store">
            <h2>How we store and secure information</h2>
            <p>
              We use industry-standard security measures to protect your
              information, including encryption, firewalls, and regular audits.
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed
              varius mauris non dui imperdiet, ac ultrices lorem viverra.
            </p>
          </section>

          <section id="retention">
            <h2>How long we keep information</h2>
            <p>
              We retain information only as long as necessary to provide our
              services or comply with legal obligations. Once no longer needed,
              data is securely deleted or anonymized.
            </p>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam
              erat volutpat. Nunc porttitor odio eget tortor aliquet sodales.
            </p>
          </section>

          <section id="access">
            <h2>How to access and control your information</h2>
            <p>
              You may request access to the information we hold about you and
              ask for corrections or deletions where applicable.
            </p>
            <p>
              Nulla et lorem eu nisi aliquet posuere. Vestibulum a elit a ante
              tincidunt commodo sed vel nibh.
            </p>
          </section>

          <section id="children">
            <h2>Our policy towards children</h2>
            <p>
              Our services are not directed to children under 13, and we do not
              knowingly collect personal information from them.
            </p>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed
              convallis ligula non purus pretium volutpat.
            </p>
          </section>

          <section id="regional">
            <h2>Regional disclosures</h2>
            <p>
              Depending on your location, you may have additional rights under
              applicable privacy laws. Lorem ipsum dolor sit amet, consectetur
              adipiscing elit. Vestibulum ac orci vel velit iaculis malesuada.
            </p>
          </section>

          <section id="changes">
            <h2>Changes to our privacy policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We encourage
              you to review it periodically. Lorem ipsum dolor sit amet,
              consectetur adipiscing elit.
            </p>
          </section>

          <section id="contact">
            <h2>How to contact us</h2>
            <p>
              If you have questions, please contact us at{" "}
              <a href="mailto:privacy@clockwork.ai">privacy@clockwork.ai</a>.
            </p>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi
              pretium dui vitae odio condimentum, ac tempor justo hendrerit.
            </p>
          </section>
        </main>
      </div>
    </div>
  );
};

export default Policy;
