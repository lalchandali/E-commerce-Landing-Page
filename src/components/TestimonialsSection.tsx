import { useEffect, useState } from 'react';

interface ReviewItem {
  id: string;
  author: string;
  role: string;
  organization: string;
  location: string;
  product: string;
  rating: number;
  quote: string;
}

const REVIEWS: ReviewItem[] = [
  {
    id: 'rev-1',
    author: 'Nadia Karim',
    role: 'Trail Coordinator',
    organization: 'Dhaka Trail Runners',
    location: 'Bandarban, BD',
    product: 'Material Flask 950 ml · Alpine Sage',
    rating: 5,
    quote:
      'Before switching, plastic bottles turned lukewarm before midday on humid hill climbs. After two seasons in Bandarban, water stays cold past dusk and the matte coat never slips with sweaty hands.',
  },
  {
    id: 'rev-2',
    author: 'Daniel Park',
    role: 'Lead Alpine Guide',
    organization: 'Front Range Mountaineering',
    location: 'Boulder, CO',
    product: 'Material Flask 1.2 L · Basalt Black',
    rating: 5,
    quote:
      'Used to carry bulky foam sleeves to keep tea hot on 4 a.m. ridge starts. The 1.2 L holds steam for 12 hours inside a pack pocket and shrugs off granite scrapes without denting the seal.',
  },
  {
    id: 'rev-3',
    author: 'Sadia Rahman',
    role: 'Documentary Photographer',
    organization: 'Chittagong Hill Collective',
    location: 'Rangamati, BD',
    product: 'Summit Trail Canister 600 ml · Basalt Black',
    rating: 5,
    quote:
      'Cold trail rations were wearing me down on dawn shoots. Now hot broth stays piping until afternoon boat crossings, and the pressure-release collar opens cleanly every single time.',
  },
  {
    id: 'rev-4',
    author: 'Tomasz Kowalski',
    role: 'Shelter Steward',
    organization: 'High Tatras Alpine Hut',
    location: 'Zakopane, PL',
    product: 'Basecamp Pour-Over Carafe 1.0 L · Glacier Silver',
    rating: 5,
    quote:
      'Glass carafes cracked in transit twice in one winter. The steel dripper and vacuum carafe brew clean coffee for four climbers at once and keep the second cup hot hours later.',
  },
  {
    id: 'rev-5',
    author: 'Maya Lin',
    role: 'Field Hydrologist',
    organization: 'Pacific Watershed Lab',
    location: 'Portland, OR',
    product: 'Ridge Camp Tumbler 450 ml · Alpine Sage',
    rating: 5,
    quote:
      'Cheap camp mugs always left metallic notes after morning espresso. The 18/8 interior rinses flavor-free in seconds and drops cleanly into truck cup holders between river stations.',
  },
  {
    id: 'rev-6',
    author: 'Tariq Mahmud',
    role: 'Endurance Cyclist',
    organization: 'Sylhet Randonneurs',
    location: 'Sylhet, BD',
    product: 'Material Flask 750 ml + Trail Sling Kit',
    rating: 5,
    quote:
      'Switched from leaky soft flasks on 200 km monsoon brevets. Zero condensation inside my frame bag, and the silicone boot absorbs gravel vibration without a rattle.',
  },
];

function StarRating({ rating }: { rating: number }) {
  return (
    <div
      className="review-stars"
      aria-label={`${rating} out of 5 stars`}
    >
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill={star <= rating ? 'currentColor' : 'none'}
          stroke="currentColor"
          strokeWidth="1.8"
          aria-hidden="true"
        >
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
    </div>
  );
}

export function TestimonialsSection() {
  const [visibleCount, setVisibleCount] = useState<number>(3);
  const [activeIndex, setActiveIndex] = useState<number>(0);

  useEffect(() => {
    const updateVisibleCount = () => {
      const w = window.innerWidth;
      if (w < 680) setVisibleCount(1);
      else if (w < 1040) setVisibleCount(2);
      else setVisibleCount(3);
    };

    updateVisibleCount();
    window.addEventListener('resize', updateVisibleCount, { passive: true });
    return () => window.removeEventListener('resize', updateVisibleCount);
  }, []);

  const maxIndex = Math.max(0, REVIEWS.length - visibleCount);
  const safeIndex = Math.min(activeIndex, maxIndex);

  useEffect(() => {
    if (activeIndex > maxIndex) {
      setActiveIndex(maxIndex);
    }
  }, [activeIndex, maxIndex]);

  const handlePrev = () => {
    setActiveIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
  };

  const pageCount = maxIndex + 1;
  const stepPct = 100 / REVIEWS.length;

  return (
    <section
      id="testimonials"
      className="testimonials-section"
      aria-labelledby="testimonials-heading"
      onKeyDown={(e) => {
        if (e.key === 'ArrowLeft') handlePrev();
        if (e.key === 'ArrowRight') handleNext();
      }}
    >
      <div className="container">
        <div className="testimonials-header">
          <div>
            <h2 id="testimonials-heading" className="section-title">
              Field-tested voices.
            </h2>
            <p className="section-sub">
              4.9 / 5.0 average across 420+ verified hikers, guides, and daily
              commuters.
            </p>
          </div>

          <div className="testimonials-controls">
            <button
              type="button"
              className="icon-btn carousel-arrow-btn"
              aria-label="Previous customer reviews"
              onClick={handlePrev}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <polyline
                  points="15 18 9 12 15 6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <button
              type="button"
              className="icon-btn carousel-arrow-btn"
              aria-label="Next customer reviews"
              onClick={handleNext}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <polyline
                  points="9 18 15 12 9 6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </div>

        <div
          className="testimonials-viewport"
          role="region"
          aria-roledescription="carousel"
          aria-label="Customer reviews"
        >
          <div
            className="testimonials-track"
            style={{
              width: `${(REVIEWS.length / visibleCount) * 100}%`,
              transform: `translate3d(-${safeIndex * stepPct}%, 0, 0)`,
            }}
          >
            {REVIEWS.map((review) => (
              <div
                key={review.id}
                className="testimonial-slide"
                style={{ width: `${stepPct}%` }}
              >
                <article className="testimonial-card">
                  <div className="testimonial-top">
                    <StarRating rating={review.rating} />
                    <span className="testimonial-score">
                      {review.rating.toFixed(1)}
                    </span>
                  </div>

                  <p className="testimonial-quote">“{review.quote}”</p>

                  <div className="testimonial-footer">
                    <div className="testimonial-author-name">
                      {review.author}
                    </div>
                    <div className="testimonial-author-role">
                      {review.role} · {review.organization}
                    </div>
                    <div className="testimonial-meta">
                      <span>{review.product}</span>
                      <span aria-hidden="true">·</span>
                      <span>{review.location}</span>
                    </div>
                  </div>
                </article>
              </div>
            ))}
          </div>
        </div>

        <div
          className="testimonials-dots"
          role="tablist"
          aria-label="Review carousel slides"
        >
          {Array.from({ length: pageCount }).map((_, idx) => (
            <button
              key={idx}
              type="button"
              role="tab"
              aria-selected={safeIndex === idx}
              aria-label={`Show reviews starting at ${idx + 1}`}
              className={`testimonials-dot${safeIndex === idx ? ' is-active' : ''}`}
              onClick={() => setActiveIndex(idx)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
