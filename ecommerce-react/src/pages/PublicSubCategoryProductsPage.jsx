import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { fetchPublicSubCategoryProducts } from '../api/client';

function formatPrice(value) {
  const numberValue = Number(value || 0);
  return Number.isFinite(numberValue) ? numberValue.toFixed(2) : '0.00';
}

export default function PublicSubCategoryProductsPage() {
  const { categorySlug, subCategorySlug } = useParams();
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';
  const [pageData, setPageData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function loadProducts() {
      setLoading(true);
      setError('');

      try {
        const data = await fetchPublicSubCategoryProducts(categorySlug, subCategorySlug);
        if (!cancelled) {
          setPageData(data);
        }
      } catch (requestError) {
        if (!cancelled) {
          setPageData(null);
          setError(requestError.response?.status === 404 ? 'Sub category not found.' : 'Unable to load products right now.');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadProducts();

    return () => {
      cancelled = true;
    };
  }, [categorySlug, subCategorySlug]);

  const category = pageData?.category;
  const subCategory = pageData?.sub_category;
  const products = useMemo(() => (Array.isArray(pageData?.products) ? pageData.products : []), [pageData]);
  const categoryImage = category?.image_url || (category?.image_path ? `${apiBaseUrl}/storage/${category.image_path}` : '');
  const subCategoryImage = subCategory?.image_url || (subCategory?.image_path ? `${apiBaseUrl}/storage/${subCategory.image_path}` : '');

  return (
    <div className="catalog-page">
      <div className="catalog-shell">
        <div className="catalog-header">
          <Link to={`/categories/${categorySlug}`} className="catalog-home-link">← Back to Category</Link>
          <img className="catalog-logo" src="/messaraliving-logo.png" alt="MessaraLiving" />
        </div>

        <div className="catalog-breadcrumbs">
          <Link to="/">Home</Link>
          <span>/</span>
          <Link to={`/categories/${categorySlug}`}>{category?.name || 'Category'}</Link>
          <span>/</span>
          <span>{loading ? 'Loading...' : subCategory?.name || 'Sub Category'}</span>
        </div>

        {loading ? (
          <>
            <section className="catalog-hero catalog-hero-loading" />
            <section className="catalog-loading-grid product-grid-public">
              {[0, 1, 2].map((item) => (
                <div key={item} className="catalog-loading-card" />
              ))}
            </section>
          </>
        ) : error ? (
          <section className="catalog-empty-state">
            <h1>{error}</h1>
            <p>We could not load the sub category products right now. Please return and try another section.</p>
            <Link to={`/categories/${categorySlug}`} className="catalog-primary-link">Back to Category</Link>
          </section>
        ) : (
          <>
            <section className="catalog-hero product-hero">
              <div className="catalog-hero-copy">
                <span className="catalog-eyebrow">Sub Category Collection</span>
                <h1>{subCategory?.name}</h1>
                <p className="catalog-hero-description">
                  {subCategory?.description || `Explore every product we currently have inside ${subCategory?.name?.toLowerCase() || 'this section'}.`} 
                </p>
                <div className="catalog-stat-grid">
                  <div className="catalog-stat-card">
                    <strong>{products.length}</strong>
                    <span>Products live</span>
                  </div>
                  <div className="catalog-stat-card">
                    <strong>{category?.name || '-'}</strong>
                    <span>Parent category</span>
                  </div>
                </div>
              </div>
              <div className="product-hero-stack">
                <div className="product-hero-card large">
                  {subCategoryImage ? <img src={subCategoryImage} alt={subCategory?.name} /> : <div className="catalog-hero-placeholder">{subCategory?.name}</div>}
                </div>
                <div className="product-hero-card small">
                  {categoryImage ? <img src={categoryImage} alt={category?.name} /> : <div className="catalog-hero-placeholder">{category?.name}</div>}
                </div>
              </div>
            </section>

            <section className="catalog-section">
              <div className="catalog-section-head">
                <div>
                  <h2>Products in {subCategory?.name}</h2>
                  <p>Clear product cards with pricing, stock status, and a direct route into each detail page.</p>
                </div>
                <span className="catalog-section-meta">{products.length} items available</span>
              </div>

              {products.length > 0 ? (
                <div className="product-grid-public">
                  {products.map((product) => (
                    <Link
                      key={product.id}
                      to={`/categories/${categorySlug}/sub-categories/${subCategorySlug}/products/${product.slug}`}
                      className="product-card-public"
                    >
                      <div className="product-card-public-media">
                        {product.image_url ? (
                          <img src={product.image_url} alt={product.name} />
                        ) : (
                          <div className="subcategory-card-placeholder" />
                        )}
                        {Number(product.discount_price || 0) > 0 && <span className="product-sale-badge">Sale</span>}
                      </div>
                      <div className="product-card-public-body">
                        <div className="product-card-public-meta">
                          <span>{product.brand?.name || category?.name || 'MessaraLiving'}</span>
                          <span>{Number(product.stock || 0) > 0 ? `${product.stock} in stock` : 'Out of stock'}</span>
                        </div>
                        <h3>{product.name}</h3>
                        <p>
                          {product.description || `Modern ${subCategory?.name?.toLowerCase() || 'product'} styling with a clean, easy-to-understand presentation.`}
                        </p>
                        <div className="product-card-public-footer">
                          <div className="event-product-price">
                            {Number(product.discount_price || 0) > 0 ? (
                              <>
                                <span className="price-old">AED {formatPrice(product.price)}</span>
                                <span className="price-discount">AED {formatPrice(product.discount_price)}</span>
                              </>
                            ) : (
                              <span className="product-price-plain">AED {formatPrice(product.price)}</span>
                            )}
                          </div>
                          <span className="product-card-public-arrow">→</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="catalog-empty-panel">
                  <h3>No products yet</h3>
                  <p>This sub category is ready, but no active products are attached to it yet.</p>
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </div>
  );
}
