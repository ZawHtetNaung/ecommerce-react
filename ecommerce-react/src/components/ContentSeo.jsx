import { useEffect } from 'react';

function setMeta(name, content) {
  let element = document.querySelector(`meta[name="${name}"]`);
  if (!element) {
    element = document.createElement('meta');
    element.name = name;
    document.head.appendChild(element);
  }
  element.content = content || '';
}

export default function ContentSeo({ title, description, path }) {
  useEffect(() => {
    if (!title) return undefined;
    document.title = title;
    setMeta('description', description);
    setMeta('robots', 'index, follow');

    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = `${window.location.origin}${path || window.location.pathname}`;
    return undefined;
  }, [description, path, title]);

  return null;
}
