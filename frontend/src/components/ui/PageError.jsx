const PageError = ({ title = 'Error al cargar datos', message, onRetry }) => (
  <div className="p-6">
    <div className="bg-error-container rounded-lg p-4">
      <h3 className="text-on-error-container font-medium">{title}</h3>
      {message && (
        <p className="text-on-error-container text-sm mt-1 opacity-80">{message}</p>
      )}
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-3 px-4 py-2 bg-error text-white rounded-md hover:brightness-90 text-sm"
        >
          Reintentar
        </button>
      )}
    </div>
  </div>
);

export default PageError;
