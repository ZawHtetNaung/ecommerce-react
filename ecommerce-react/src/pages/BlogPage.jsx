import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { fetchPublicBlogCategories, fetchPublicBlogPosts } from '../api/client';
import StorefrontHeader from '../components/StorefrontHeader';

function formatDate(value) {
  if (!value) return '';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '' : new Intl.DateTimeFormat('en-AE', { day: 'numeric', month: 'short', year: 'numeric' }).format(date);
}

function BlogImage({ post }) {
  return post.cover_image_url
    ? <img src={post.cover_image_url} alt={post.cover_image_alt || post.title} />
    : <span className="content-image-placeholder blog-placeholder"><b>Journal</b></span>;
}

export default function BlogPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeCategory = searchParams.get('category') || '';
  const [categories, setCategories] = useState([]);
  const [posts, setPosts] = useState([]);
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPublicBlogCategories().then((data) => setCategories(Array.isArray(data) ? data : [])).catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');
    fetchPublicBlogPosts(1, 12, activeCategory ? { category: activeCategory } : {})
      .then((data) => {
        if (cancelled) return;
        setPosts(Array.isArray(data?.data) ? data.data : []);
        setMeta(data?.meta || { current_page: 1, last_page: 1, total: 0 });
      })
      .catch((requestError) => {
        if (cancelled) return;
        setPosts([]);
        setError(requestError.response?.data?.message || 'Unable to load the journal right now.');
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [activeCategory]);

  const featuredPost = useMemo(() => posts.find((post) => post.is_featured) || posts[0] || null, [posts]);
  const gridPosts = featuredPost ? posts.filter((post) => post.id !== featuredPost.id) : posts;

  async function loadMore() {
    if (loadingMore || Number(meta.current_page) >= Number(meta.last_page)) return;
    setLoadingMore(true);
    try {
      const data = await fetchPublicBlogPosts(Number(meta.current_page) + 1, 12, activeCategory ? { category: activeCategory } : {});
      setPosts((current) => [...current, ...(Array.isArray(data?.data) ? data.data : [])]);
      setMeta(data?.meta || meta);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to load more articles.');
    } finally {
      setLoadingMore(false);
    }
  }

  return (
    <div className="storefront-page blog-page">
      <StorefrontHeader />
      <main className="content-hub-shell">
        <section className="blog-hero">
          <span className="store-eyebrow">The Messara journal</span>
          <h1>Ideas, materials, and guidance for better spaces.</h1>
          <p>Buying advice, interior inspiration, product knowledge, company news, and a closer look at new collections.</p>
        </section>

        <nav className="content-filter-tabs blog-filter-tabs" aria-label="Blog categories">
          <button type="button" className={!activeCategory ? 'is-active' : ''} onClick={() => setSearchParams({})}>All stories</button>
          {categories.map((category) => (
            <button type="button" key={category.id} className={activeCategory === category.slug ? 'is-active' : ''} onClick={() => setSearchParams({ category: category.slug })}>
              {category.name}{Number(category.posts_count || 0) > 0 && <small>{category.posts_count}</small>}
            </button>
          ))}
        </nav>

        {error && <p className="content-page-error">{error}</p>}
        {loading ? (
          <div className="content-page-loading">Loading stories…</div>
        ) : featuredPost ? (
          <>
            <Link to={`/blog/${featuredPost.slug}`} className="blog-feature-card">
              <div className="blog-feature-image"><BlogImage post={featuredPost} /></div>
              <div className="blog-feature-copy">
                <span>{featuredPost.category?.name || 'Journal'} · {formatDate(featuredPost.published_at)}</span>
                <h2>{featuredPost.title}</h2>
                <p>{featuredPost.excerpt || 'Read the complete story from Messara Living.'}</p>
                <strong>Read story <span>→</span></strong>
              </div>
            </Link>

            {gridPosts.length > 0 && (
              <section className="blog-grid" aria-label="Latest stories">
                {gridPosts.map((post) => (
                  <article className="blog-card" key={post.id}>
                    <Link to={`/blog/${post.slug}`} className="blog-card-image"><BlogImage post={post} /></Link>
                    <div className="blog-card-copy">
                      <span>{post.category?.name || 'Journal'} · {formatDate(post.published_at)}</span>
                      <h2><Link to={`/blog/${post.slug}`}>{post.title}</Link></h2>
                      <p>{post.excerpt || 'Discover this story from Messara Living.'}</p>
                      <Link to={`/blog/${post.slug}`}>Read article <span>→</span></Link>
                    </div>
                  </article>
                ))}
              </section>
            )}

            {Number(meta.current_page) < Number(meta.last_page) && (
              <button type="button" className="content-load-more" disabled={loadingMore} onClick={loadMore}>{loadingMore ? 'Loading…' : 'Show more stories'}</button>
            )}
          </>
        ) : (
          <section className="content-empty-state">
            <span>Messara journal</span>
            <h2>New stories are being prepared.</h2>
            <p>Our buying guides, material advice, project ideas, and collection news will appear here.</p>
            <Link to="/search">Explore the collection</Link>
          </section>
        )}
      </main>
    </div>
  );
}
