import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchPublicProjects } from '../api/client';
import StorefrontHeader from '../components/StorefrontHeader';

const projectTypes = [
  ['all', 'All projects'],
  ['residential', 'Residential'],
  ['commercial', 'Commercial'],
  ['hospitality', 'Hospitality'],
  ['office', 'Office'],
];

function typeLabel(value) {
  return value ? value.charAt(0).toUpperCase() + value.slice(1) : 'Project';
}

function year(value) {
  if (!value) return '';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '' : date.getFullYear();
}

function ProjectImage({ project }) {
  return project.cover_image_url
    ? <img src={project.cover_image_url} alt={project.cover_image_alt || project.title} />
    : <span className="content-image-placeholder"><b>ML</b></span>;
}

export default function ProjectsPage() {
  const [activeType, setActiveType] = useState('all');
  const [projects, setProjects] = useState([]);
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');
    fetchPublicProjects(1, 12, activeType === 'all' ? {} : { type: activeType })
      .then((data) => {
        if (cancelled) return;
        setProjects(Array.isArray(data?.data) ? data.data : []);
        setMeta(data?.meta || { current_page: 1, last_page: 1, total: 0 });
      })
      .catch((requestError) => {
        if (cancelled) return;
        setProjects([]);
        setError(requestError.response?.data?.message || 'Unable to load projects right now.');
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [activeType]);

  const featuredProject = useMemo(
    () => projects.find((project) => project.is_featured) || projects[0] || null,
    [projects]
  );
  const gridProjects = featuredProject ? projects.filter((project) => project.id !== featuredProject.id) : projects;

  async function loadMore() {
    if (loadingMore || Number(meta.current_page) >= Number(meta.last_page)) return;
    setLoadingMore(true);
    try {
      const data = await fetchPublicProjects(Number(meta.current_page) + 1, 12, activeType === 'all' ? {} : { type: activeType });
      setProjects((current) => [...current, ...(Array.isArray(data?.data) ? data.data : [])]);
      setMeta(data?.meta || meta);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to load more projects.');
    } finally {
      setLoadingMore(false);
    }
  }

  return (
    <div className="storefront-page projects-page">
      <StorefrontHeader />
      <main className="content-hub-shell">
        <section className="projects-hero">
          <div>
            <span className="store-eyebrow">Messara Living projects</span>
            <h1>Spaces shaped around how people live and work.</h1>
            <p>Residential, hospitality, commercial, and office projects brought together through furniture, flooring, wallpaper, and considered finishing details.</p>
          </div>
          <Link to="/quotation" className="content-primary-link">Discuss your project <span>→</span></Link>
        </section>

        <nav className="content-filter-tabs" aria-label="Project types">
          {projectTypes.map(([value, label]) => (
            <button type="button" key={value} className={activeType === value ? 'is-active' : ''} onClick={() => setActiveType(value)}>{label}</button>
          ))}
        </nav>

        {error && <p className="content-page-error">{error}</p>}
        {loading ? (
          <div className="content-page-loading">Loading projects…</div>
        ) : featuredProject ? (
          <>
            <Link to={`/projects/${featuredProject.slug}`} className="project-feature-card">
              <div className="project-feature-image"><ProjectImage project={featuredProject} /></div>
              <div className="project-feature-copy">
                <span>{typeLabel(featuredProject.project_type)} {featuredProject.location ? `· ${featuredProject.location}` : ''}</span>
                <h2>{featuredProject.title}</h2>
                <p>{featuredProject.summary || 'Discover the materials, products, and details behind this Messara Living project.'}</p>
                <strong>View project <span>→</span></strong>
              </div>
            </Link>

            {gridProjects.length > 0 && (
              <section className="project-grid" aria-label="More projects">
                {gridProjects.map((project) => (
                  <Link to={`/projects/${project.slug}`} className="project-card" key={project.id}>
                    <div className="project-card-image"><ProjectImage project={project} /></div>
                    <div className="project-card-copy">
                      <span>{typeLabel(project.project_type)} {year(project.completed_at) ? `· ${year(project.completed_at)}` : ''}</span>
                      <h2>{project.title}</h2>
                      <p>{project.location || project.summary || 'Messara Living project'}</p>
                    </div>
                  </Link>
                ))}
              </section>
            )}

            {Number(meta.current_page) < Number(meta.last_page) && (
              <button type="button" className="content-load-more" disabled={loadingMore} onClick={loadMore}>{loadingMore ? 'Loading…' : 'Show more projects'}</button>
            )}
          </>
        ) : (
          <section className="content-empty-state">
            <span>Projects</span>
            <h2>Our project library is being prepared.</h2>
            <p>Contact our team to discuss residential, hospitality, commercial, or office requirements today.</p>
            <Link to="/quotation">Request a project quotation</Link>
          </section>
        )}
      </main>
    </div>
  );
}
