import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { fetchPublicSeo } from '../api/client';

function setMeta(name, content) {
  let element = document.querySelector(`meta[name="${name}"]`);
  if (!element) {
    element = document.createElement('meta');
    element.name = name;
    document.head.appendChild(element);
  }
  element.content = content;
}

export default function PageSeo() {
  const { pathname } = useLocation();

  useEffect(() => {
    if (pathname === '/projects' || pathname === '/projects/') {
      document.title = 'Interior Projects | Messara Living';
      setMeta('description', 'Explore Messara Living residential, commercial, hospitality, and office projects across the UAE.');
      setMeta('robots', 'index, follow');
    }

    if (pathname === '/blog' || pathname === '/blog/') {
      document.title = 'Interior Design Blog | Messara Living';
      setMeta('description', 'Read Messara Living buying guides, interior inspiration, material advice, company news, and new collection stories.');
      setMeta('robots', 'index, follow');
    }

    if (pathname === '/offers' || pathname === '/offers/') {
      document.title = 'Offers | Messara Living';
      setMeta('description', 'Shop current Messara Living offers across furniture, flooring, wallpaper, and home accessories in the UAE.');
      setMeta('robots', 'index, follow');
    }

    if (pathname === '/privacy-policy-2/' || pathname === '/privacy-policy-2') {
      document.title = 'Privacy Policy | Messara Living';
      setMeta('description', 'Read the Messara Living privacy policy, website terms, order, delivery, returns, refund, and installation information for the UAE.');
      setMeta('robots', 'index, follow');
    }

    if (pathname === '/checkout' || pathname === '/cart') {
      const isCheckout = pathname === '/checkout';
      document.title = `${isCheckout ? 'Checkout' : 'Shopping Cart'} | Messara Living`;
      setMeta('description', isCheckout ? 'Secure Messara Living checkout.' : 'Your Messara Living shopping cart.');
      setMeta('robots', 'noindex, nofollow');
      return undefined;
    }

    if (pathname.startsWith('/product/') || pathname.includes('/products/')) {
      setMeta('robots', 'index, follow');
      return undefined;
    }

    if (/^\/(projects|blog)\/[^/]+/.test(pathname)) {
      setMeta('robots', 'index, follow');
      return undefined;
    }

    if (pathname.startsWith('/dashboard')) {
      setMeta('robots', 'noindex, nofollow');
      return undefined;
    }
    let active = true;
    fetchPublicSeo(pathname)
      .then((page) => {
        if (!active) return;
        document.title = page.meta_title || `${page.name} | Messara Living`;
        setMeta('description', page.meta_description || '');
        setMeta('robots', page.is_indexable ? 'index, follow' : 'noindex, nofollow');
      })
      .catch(() => {});
    return () => { active = false; };
  }, [pathname]);

  return null;
}
