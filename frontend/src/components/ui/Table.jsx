import React from "react";

// Props for Table
const Table = ({ children, className = "" }) => {
  return <table className={`min-w-full ${className}`}>{children}</table>;
};

// Props for TableHeader
const TableHeader = ({ children, className = "" }) => {
  return <thead className={className}>{children}</thead>;
};

// Props for TableBody
const TableBody = ({ children, className = "" }) => {
  return <tbody className={className}>{children}</tbody>;
};

// Props for TableRow
const TableRow = ({ children, className = "" }) => {
  return <tr className={className}>{children}</tr>;
};

// Props for TableCell
const TableCell = ({ children, isHeader = false, className = "" }) => {
  const CellTag = isHeader ? "th" : "td";
  return <CellTag className={className}>{children}</CellTag>;
};

export { Table, TableHeader, TableBody, TableRow, TableCell }; 