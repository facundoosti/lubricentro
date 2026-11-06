import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const Pagination = ({ 
  currentPage, 
  totalPages, 
  onPageChange, 
  totalItems, 
  itemsPerPage,
  className = "" 
}) => {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  if (totalPages <= 1) return null;

  return (
    <div className={`flex items-center justify-between ${className}`}>
      {/* Info de items */}
      <div className="text-sm text-on-surface-variant">
        Mostrando {startItem} a {endItem} de {totalItems} resultados
      </div>

      {/* Controles de paginación */}
      <div className="flex items-center space-x-1">
        {/* Botón anterior */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="flex items-center justify-center w-8 h-8 text-sm font-medium text-on-surface-variant bg-surface-container border border-outline-variant rounded-md hover:bg-surface-container-high hover:text-on-surface disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Números de página */}
        {getPageNumbers().map((page, index) => (
          <React.Fragment key={index}>
            {page === '...' ? (
              <span className="flex items-center justify-center w-8 h-8 text-sm font-medium text-on-surface-variant">
                ...
              </span>
            ) : (
              <button
                onClick={() => onPageChange(page)}
                className={`flex items-center justify-center w-8 h-8 text-sm font-medium rounded-md ${
                  currentPage === page
                    ? 'text-white bg-primary-container border border-primary'
                    : 'text-on-surface-variant bg-surface-container border border-outline-variant hover:bg-surface-container-high hover:text-on-surface'
                }`}
              >
                {page}
              </button>
            )}
          </React.Fragment>
        ))}

        {/* Botón siguiente */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="flex items-center justify-center w-8 h-8 text-sm font-medium text-on-surface-variant bg-surface-container border border-outline-variant rounded-md hover:bg-surface-container-high hover:text-on-surface disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default Pagination; 