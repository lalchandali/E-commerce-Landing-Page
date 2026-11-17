import { useState } from 'react';
import { FAQ_ITEMS } from '../data/catalog';

export function FaqSection() {
  const [openId, setOpenId] = useState<string | null>(FAQ_ITEMS[0].id);

  const toggleItem = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <section id="faq" className="faq-section" aria-labelledby="faq-heading">
      <div className="container faq-grid">
        <div className="faq-intro">
          <h2 id="faq-heading" className="section-title">
            Common questions.
          </h2>
          <p className="section-sub">
            Shipping timelines, hassle-free returns, and simple care to keep your
            gear trail-ready for years.
          </p>
        </div>

        <div className="faq-list">
          {FAQ_ITEMS.map((item) => {
            const isOpen = openId === item.id;
            const panelId = `faq-panel-${item.id}`;
            const buttonId = `faq-btn-${item.id}`;

            return (
              <div
                key={item.id}
                id={`faq-item-${item.id}`}
                className={`faq-item${isOpen ? ' is-open' : ''}`}
              >
                <button
                  id={buttonId}
                  type="button"
                  className="faq-trigger"
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  onClick={() => toggleItem(item.id)}
                >
                  <span className="faq-trigger-text">
                    <span className="faq-category">{item.category}</span>
                    <span className="faq-question">{item.question}</span>
                  </span>
                  <span className="faq-icon" aria-hidden="true">
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <line
                        x1="5"
                        y1="12"
                        x2="19"
                        y2="12"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                      <line
                        className="faq-icon-vertical"
                        x1="12"
                        y1="5"
                        x2="12"
                        y2="19"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                  </span>
                </button>

                <div
                  id={panelId}
                  role="region"
                  aria-labelledby={buttonId}
                  className="faq-panel"
                  hidden={!isOpen}
                >
                  <p className="faq-answer">{item.answer}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
