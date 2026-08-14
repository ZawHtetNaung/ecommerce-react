import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { fetchPublicProject } from '../api/client';
import ContentSeo from '../components/ContentSeo';
import RichTextContent from '../components/RichTextContent';
import StorefrontHeader from '../components/StorefrontHeader';

function typeLabel(value) {
  return value ? value.charAt(0).toUpperCase() + value.slice(1) : 'Project';
}

function formatDate(value) {
  if (!value) return '';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '' : new Intl.DateTimeFormat('en-AE', { month: 'long', year: 'numeric' }).format(date);
}

export default function ProjectDetailPage() {
  const { projectSlug } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchPublicProject(projectSlug)
      .then((data) => { if (!cancelled) setProject(data); })
      .catch(() => { if (!cancelled) setError('This project could not be found.'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [projectSlug]);

  if (loading) return <div className="storefront-page"><StorefrontHeader /><div className="content-page-loading">Loading project…</div></div>;
  if (!project) return <div className="storefront-page"><StorefrontHeader /><section className="content-empty-state content-detail-empty"><h1>{error}</h1><Link to="/projects">Back to projects</Link></section></div>;

  const gallery = Array.isArray(project.images) ? project.images : [];
  const services = Array.isArray(project.services) ? project.services : [];
  const materials = Array.isArray(project.materials) ? project.materials : [];

  return (
    <div className="storefront-page project-detail-page">
      <ContentSeo
        title={project.meta_title || `${project.title} | Messara Living Projects`}
        description={project.meta_description || project.summary || ''}
        path={`/projects/${project.slug}`}
      />
      <StorefrontHeader />
      <main className="content-detail-shell">
        <nav className="content-breadcrumb"><Link to="/">Home</Link><span>/</span><Link to="/projects">Projects</Link><span>/</span><b>{project.title}</b></nav>
        <header className="project-detail-header">
          <div>
            <span className="store-eyebrow">{typeLabel(project.project_type)} project</span>
            <h1>{project.title}</h1>
            {project.summary && <p>{project.summary}</p>}
          </div>
          <dl>
            {project.location && <div><dt>Location</dt><dd>{project.location}</dd></div>}
            {project.area && <div><dt>Area</dt><dd>{project.area}</dd></div>}
            {project.completed_at && <div><dt>Completed</dt><dd>{formatDate(project.completed_at)}</dd></div>}
            {project.client_name && <div><dt>Client</dt><dd>{project.client_name}</dd></div>}
          </dl>
        </header>

        <div className="project-detail-cover">
          {project.cover_image_url ? <img src={project.cover_image_url} alt={project.cover_image_alt || project.title} /> : <span className="content-image-placeholder"><b>Messara Living</b></span>}
        </div>

        <section className="project-detail-content">
          <RichTextContent html={project.content || '<p>Project details will be added soon.</p>'} className="content-rich-text" />
          <aside>
            {services.length > 0 && <div><span>Services</span>{services.map((item) => <p key={item}>{item}</p>)}</div>}
            {materials.length > 0 && <div><span>Materials & products</span>{materials.map((item) => <p key={item}>{item}</p>)}</div>}
          </aside>
        </section>

        {gallery.length > 0 && (
          <section className="project-gallery" aria-label={`${project.title} gallery`}>
            {gallery.map((image) => <figure key={image.id}><img src={image.url} alt={image.alt_text || project.title} />{image.caption && <figcaption>{image.caption}</figcaption>}</figure>)}
          </section>
        )}

        <section className="content-cta-band">
          <div><span>Start a conversation</span><h2>Planning a similar space?</h2><p>Share your measurements, timeline, and product requirements with our project team.</p></div>
          <Link to="/quotation">Request a quotation <span>→</span></Link>
        </section>
      </main>
    </div>
  );
}
