const PageMeta = ({
  title,
  description,
}) => {
  // Update document title
  if (title) {
    document.title = title;
  }
  
  // Update meta description
  if (description) {
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', description);
    } else {
      const meta = document.createElement('meta');
      meta.name = 'description';
      meta.content = description;
      document.head.appendChild(meta);
    }
  }
  
  return null; // This component doesn't render anything
};

export default PageMeta;
