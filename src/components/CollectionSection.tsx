import { useState } from 'react';
import {
  CATALOG_PRODUCTS,
  FINISH_META,
  formatPrice,
  type CatalogProduct,
  type CurrencyCode,
  type FinishId,
  type ProductCategory,
} from '../data/catalog';
import { ProductArtwork } from './ProductArtwork';

interface CollectionSectionProps {
  currency: CurrencyCode;
  recentlyAddedId: string | null;
  onAddProduct: (
    product: CatalogProduct,
    finish: FinishId,
    sourceEl: HTMLButtonElement
  ) => void;
  onConfigureFlask: (finish: FinishId) => void;
}

type CategoryFilter = 'All' | ProductCategory;

const CATEGORY_FILTERS: CategoryFilter[] = [
  'All',
  'Hydration',
  'Camp & Brew',
  'Accessories',
];

export function CollectionSection({
  currency,
  recentlyAddedId,
  onAddProduct,
  onConfigureFlask,
}: CollectionSectionProps) {
  const [filter, setFilter] = useState<CategoryFilter>('All');
  const [cardFinishes, setCardFinishes] = useState<
    Record<CatalogProduct['id'], FinishId>
  >({
    'material-flask': 'sage',
    'ridge-tumbler': 'sage',
    'summit-canister': 'basalt',
    'basecamp-carafe': 'glacier',
    'trail-sling-kit': 'sage',
  });

  const visibleProducts =
    filter === 'All'
      ? CATALOG_PRODUCTS
      : CATALOG_PRODUCTS.filter((p) => p.category === filter);

  return (
    <section
      id="collection"
      className="collection-section"
      aria-labelledby="collection-heading"
    >
      <div className="container">
        <div className="collection-header">
          <div>
            <h2 id="collection-heading" className="section-title">
              Trail carry lineup.
            </h2>
            <p className="section-sub">
              Double-wall stainless vessels and modular carry hardware built to
              match every route.
            </p>
          </div>

          <div
            className="collection-filters"
            role="tablist"
            aria-label="Filter products by category"
          >
            {CATEGORY_FILTERS.map((cat) => (
              <button
                key={cat}
                type="button"
                role="tab"
                aria-selected={filter === cat}
                className={`collection-filter-btn${filter === cat ? ' is-active' : ''}`}
                onClick={() => setFilter(cat)}
              >
                {cat === 'All' ? 'All Gear' : cat}
              </button>
            ))}
          </div>
        </div>

        <div className="collection-grid">
          {visibleProducts.map((product) => {
            const activeFinish = cardFinishes[product.id] ?? 'sage';
            const isAdded = recentlyAddedId === product.id;

            return (
              <article
                key={product.id}
                id={`product-card-${product.id}`}
                className="product-card"
              >
                <div className="product-media">
                  <ProductArtwork
                    productId={product.id}
                    finish={activeFinish}
                  />
                </div>

                <div className="product-body">
                  <div className="product-meta">
                    <span>{product.category}</span>
                    <span aria-hidden="true">·</span>
                    <span>{product.capacityLabel}</span>
                    <span aria-hidden="true">·</span>
                    <span>{product.thermalSpec}</span>
                  </div>

                  <div className="product-title-row">
                    <h3 className="product-name">{product.name}</h3>
                    <span className="product-price">
                      {formatPrice(product.price, currency)}
                    </span>
                  </div>

                  <p className="product-summary">{product.summary}</p>

                  <div className="product-card-controls">
                    <div
                      className="product-finish-row"
                      role="radiogroup"
                      aria-label={`${product.name} finish`}
                    >
                      {(Object.keys(FINISH_META) as FinishId[]).map((key) => {
                        const meta = FINISH_META[key];
                        const selected = activeFinish === key;
                        return (
                          <button
                            key={key}
                            type="button"
                            role="radio"
                            aria-checked={selected}
                            aria-label={meta.name}
                            title={meta.name}
                            className={`product-dot-btn${selected ? ' is-active' : ''}`}
                            onClick={() =>
                              setCardFinishes((prev) => ({
                                ...prev,
                                [product.id]: key,
                              }))
                            }
                          >
                            <span
                              className="product-dot-swatch"
                              style={{ background: meta.dot }}
                            />
                          </button>
                        );
                      })}
                      <span className="product-finish-name">
                        {FINISH_META[activeFinish].name}
                      </span>
                    </div>

                    <div className="product-actions">
                      {product.configurable && (
                        <a
                          href="#order"
                          className="btn btn-ghost btn-sm product-cfg-link"
                          onClick={() => onConfigureFlask(activeFinish)}
                        >
                          Sizes
                        </a>
                      )}
                      <button
                        type="button"
                        className={`btn btn-primary btn-sm product-add-btn${isAdded ? ' is-added' : ''}`}
                        onClick={(e) =>
                          onAddProduct(product, activeFinish, e.currentTarget)
                        }
                      >
                        {isAdded ? 'Added ✓' : 'Add to Bag'}
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
