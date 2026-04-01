import { useState } from 'react';

/**
 * Encapsula el estado repetido en todas las páginas CRUD:
 * paginación, búsqueda, modal de formulario (create/edit) y modal de confirmación de borrado.
 */
export const useCrudPage = ({ defaultPerPage = 10 } = {}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [perPage] = useState(defaultPerPage);

  // Modal de formulario — null = crear, objeto = editar
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  // Modal de confirmación de borrado
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  const handlePageChange = (page) => setCurrentPage(page);

  const handleSearch = (term) => {
    setSearchTerm(term);
    setCurrentPage(1);
  };

  const handleCreate = () => {
    setSelectedItem(null);
    setIsModalOpen(true);
  };

  const handleEdit = (item) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedItem(null);
  };

  const handleDeleteRequest = (item) => {
    setItemToDelete(item);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteModalClose = () => {
    setIsDeleteModalOpen(false);
    setItemToDelete(null);
  };

  return {
    currentPage,
    searchTerm,
    perPage,
    isModalOpen,
    selectedItem,
    isDeleteModalOpen,
    itemToDelete,
    handlePageChange,
    handleSearch,
    handleCreate,
    handleEdit,
    handleModalClose,
    handleDeleteRequest,
    handleDeleteModalClose,
  };
};
