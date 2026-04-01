const PageHeader = ({ title, description }) => (
  <div className="mb-6">
    <h1 className="text-2xl font-bold text-on-surface">{title}</h1>
    {description && (
      <p className="text-secondary mt-1">{description}</p>
    )}
  </div>
);

export default PageHeader;
