import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { fetchPublicBlogPost } from '../api/client';
import ContentSeo from '../components/ContentSeo';
import RichTextContent from '../components/RichTextContent';
import StorefrontHeader from '../components/StorefrontHeader';

function formatDate(value) {
  if (!value) return '';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '' : new Intl.DateTimeFormat('en-AE', { day: 'numeric', month: 'long', year: 'numeric' }).format(date);
}

export default function BlogDetailPage() {
  const { postSlug } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchPublicBlogPost(postSlug)
      .then((data) => { if (!cancelled) setPost(data); })
      .catch(() => { if (!cancelled) setPost(null); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [postSlug]);

  if (loading) return <div className="storefront-page"><StorefrontHeader /><div className="content-page-loading">Loading article…</div></div>;
  if (!post) return <div className="storefront-page"><StorefrontHeader /><section className="content-empty-state content-detail-empty"><h1>This article could not be found.</h1><Link to="/blog">Back to the blog</Link></section></div>;

  return (
    <div className="storefront-page blog-detail-page">
      <ContentSeo
        title={post.meta_title || `${post.title} | Messara Living Blog`}
        description={post.meta_description || post.excerpt || ''}
        path={`/blog/${post.slug}`}
      />
      <StorefrontHeader />
      <main className="blog-detail-shell">
        <nav className="content-breadcrumb"><Link to="/">Home</Link><span>/</span><Link to="/blog">Blog</Link><span>/</span><b>{post.title}</b></nav>
        <header className="blog-detail-header">
          <span className="store-eyebrow">{post.category?.name || 'Messara journal'}</span>
          <h1>{post.title}</h1>
          {post.excerpt && <p>{post.excerpt}</p>}
          <div><span>{formatDate(post.published_at)}</span>{post.author_name && <span>By {post.author_name}</span>}</div>
        </header>

        {post.cover_image_url && <figure className="blog-detail-cover"><img src={post.cover_image_url} alt={post.cover_image_alt || post.title} /></figure>}
        <RichTextContent html={post.content || '<p>Article content will be added soon.</p>'} className="content-rich-text blog-article-content" />

        <section className="blog-detail-footer">
          <div><span>Continue exploring</span><h2>Find pieces for your next space.</h2></div>
          <div><Link to="/blog">More stories</Link><Link to="/search">Shop products</Link></div>
        </section>
      </main>
    </div>
  );
}
