const PageHeader = ({ title, description, actions }) => (
  <div className="mb-6 flex items-start justify-between gap-4">
    <div>
      <h1 className="text-2xl font-bold text-on-surface">{title}</h1>
      {description && (
        <p className="text-secondary mt-1">{description}</p>
      )}
    </div>
    {actions && <div className="shrink-0">{actions}</div>}
  </div>
);

export default PageHeader;
