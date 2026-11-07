import { useEffect } from 'react';

const PageMeta = ({
  title,
  description,
}) => {
  // Título de la pestaña: al desmontar se restaura el anterior,
  // así las páginas sin PageMeta (ej. /login) no heredan "Dashboard - …"
  useEffect(() => {
    if (!title) return undefined;
    const previousTitle = document.title;
    document.title = title;
    return () => {
      document.title = previousTitle;
    };
  }, [title]);

  useEffect(() => {
    if (!description) return;
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', description);
    } else {
      const meta = document.createElement('meta');
      meta.name = 'description';
      meta.content = description;
      document.head.appendChild(meta);
    }
  }, [description]);

  return null;
};

export default PageMeta;
