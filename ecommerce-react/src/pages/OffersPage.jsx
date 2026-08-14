import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchPublicOffers, fetchPublicProductFilters } from '../api/client';
import OfferCountdown from '../components/OfferCountdown';
import StorefrontHeader from '../components/StorefrontHeader';
import StoreProductCard from '../components/StoreProductCard';
import { formatAmount } from '../utils/price';

const defaultFilters = {
  category_id: '',
  brand_id: '',
  event_id: '',
  sort: 'saving_desc',
};

function formatEventOffer(eventItem) {
  const value = Number(eventItem?.discount_value || 0);
  if (value <= 0) return 'Special event prices';
  return eventItem.discount_type === 'percent'
    ? `${value.toFixed(value % 1 === 0 ? 0 : 1)}% off selected pieces`
    : `AED ${formatAmount(value, { maximumFractionDigits: 0 })} off selected pieces`;
}

function formatEventEnd(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('en-AE', { day: 'numeric', month: 'short', year: 'numeric' }).format(date);
}

export default function OffersPage() {
  const [filters, setFilters] = useState(defaultFilters);
  const [filterOptions, setFilterOptions] = useState({ categories: [], brands: [] });
  const [products, setProducts] = useState([]);
  const [events, setEvents] = useState([]);
  const [pagination, setPagination] = useState({ currentPage: 1, lastPage: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPublicProductFilters()
      .then(setFilterOptions)
      .catch(() => setFilterOptions({ categories: [], brands: [] }));
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadOffers() {
      setLoading(true);
      setError('');
      try {
        const data = await fetchPublicOffers(1, 12, filters);
        if (cancelled) return;
        setProducts(Array.isArray(data?.data) ? data.data : []);
        setEvents(Array.isArray(data?.events) ? data.events : []);
        setPagination({
          currentPage: Number(data?.meta?.current_page || 1),
          lastPage: Number(data?.meta?.last_page || 1),
          total: Number(data?.meta?.total || 0),
        });
      } catch (requestError) {
        if (!cancelled) {
          setProducts([]);
          setEvents([]);
          setError(requestError.response?.data?.message || 'Unable to load current offers.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadOffers();
    return () => { cancelled = true; };
  }, [filters]);

  const selectedEvent = useMemo(
    () => events.find((eventItem) => String(eventItem.id) === String(filters.event_id)),
    [events, filters.event_id]
  );

  const countdownEvent = useMemo(
    () => selectedEvent || events.find((eventItem) => eventItem?.ends_at),
    [events, selectedEvent]
  );

  function updateFilter(event) {
    const { name, value } = event.target;
    setFilters((current) => ({ ...current, [name]: value }));
  }

  async function loadMore() {
    if (loadingMore || pagination.currentPage >= pagination.lastPage) return;
    setLoadingMore(true);
    setError('');
    try {
      const nextPage = pagination.currentPage + 1;
      const data = await fetchPublicOffers(nextPage, 12, filters);
      const nextProducts = Array.isArray(data?.data) ? data.data : [];
      setProducts((current) => [...current, ...nextProducts]);
      setPagination({
        currentPage: Number(data?.meta?.current_page || nextPage),
        lastPage: Number(data?.meta?.last_page || nextPage),
        total: Number(data?.meta?.total || products.length + nextProducts.length),
      });
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to load more offers.');
    } finally {
      setLoadingMore(false);
    }
  }

  return (
    <div className="storefront-page offers-page">
      <StorefrontHeader />
      <main className="offers-page-shell">
        <section className="offers-page-hero">
          <div>
            <span className="store-eyebrow">Now at Messara Living</span>
            <h1>{selectedEvent?.name || 'More style. Better prices.'}</h1>
            <p>
              {selectedEvent
                ? formatEventOffer(selectedEvent)
                : 'Discover furniture, flooring, wallpaper, and finishing touches currently available at a better price.'}
            </p>
            {selectedEvent?.ends_at && <small>Available through {formatEventEnd(selectedEvent.ends_at)}</small>}
            <OfferCountdown
              endsAt={countdownEvent?.ends_at}
              label={selectedEvent ? 'Offer ends in' : `${countdownEvent?.name || 'Event'} ends in`}
              className="offers-page-countdown"
            />
          </div>
          <div className="offers-page-count" aria-label={`${pagination.total} products on offer`}>
            <strong>{pagination.total}</strong>
            <span>{pagination.total === 1 ? 'offer available' : 'offers available'}</span>
          </div>
        </section>

        {events.length > 0 && (
          <nav className="offers-event-tabs" aria-label="Current offer events">
            <button
              type="button"
              className={filters.event_id === '' ? 'is-active' : ''}
              onClick={() => setFilters((current) => ({ ...current, event_id: '' }))}
            >
              All offers
            </button>
            {events.map((eventItem) => (
              <button
                type="button"
                key={eventItem.id}
                className={String(filters.event_id) === String(eventItem.id) ? 'is-active' : ''}
                onClick={() => setFilters((current) => ({ ...current, event_id: String(eventItem.id) }))}
              >
                <span>{eventItem.name}</span>
                <small>{eventItem.offers_count}</small>
              </button>
            ))}
          </nav>
        )}

        <div className="offers-page-layout">
          <aside className="offers-filter-panel">
            <div>
              <span>Refine</span>
              <h2>Find your piece</h2>
            </div>
            <label>
              Category
              <select name="category_id" value={filters.category_id} onChange={updateFilter}>
                <option value="">All categories</option>
                {(filterOptions.categories || []).map((category) => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
            </label>
            <label>
              Brand
              <select name="brand_id" value={filters.brand_id} onChange={updateFilter}>
                <option value="">All brands</option>
                {(filterOptions.brands || []).map((brand) => (
                  <option key={brand.id} value={brand.id}>{brand.name}</option>
                ))}
              </select>
            </label>
            <button type="button" className="offers-clear-filters" onClick={() => setFilters(defaultFilters)}>
              Reset filters
            </button>
          </aside>

          <section className="offers-results" aria-live="polite">
            <div className="offers-results-toolbar">
              <span>{loading ? 'Finding current offers...' : `${pagination.total} products at a better price`}</span>
              <label>
                Sort
                <select name="sort" value={filters.sort} onChange={updateFilter}>
                  <option value="saving_desc">Biggest saving</option>
                  <option value="newest">Newest first</option>
                  <option value="price_asc">Price: low to high</option>
                  <option value="price_desc">Price: high to low</option>
                </select>
              </label>
            </div>

            {error && <div className="store-alert error">{error}</div>}
            {loading ? (
              <div className="store-product-grid">
                {[0, 1, 2, 3, 4, 5].map((item) => <div key={item} className="store-product-skeleton" />)}
              </div>
            ) : products.length > 0 ? (
              <>
                <div className="store-product-grid">
                  {products.map((product) => <StoreProductCard key={product.id} product={product} />)}
                </div>
                {pagination.currentPage < pagination.lastPage && (
                  <button type="button" className="store-load-more" onClick={loadMore} disabled={loadingMore}>
                    {loadingMore ? 'Loading...' : 'Show more offers'}
                  </button>
                )}
              </>
            ) : (
              <div className="offers-empty-state">
                <span>More considered choices are on the way</span>
                <h2>New offers coming soon.</h2>
                <p>Explore the full collection while our next edit is being prepared.</p>
                <Link to="/search">Browse all products <span>→</span></Link>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
