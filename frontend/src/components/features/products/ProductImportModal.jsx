import { useState, useRef, useEffect } from 'react';
import { Upload, Download, FileSpreadsheet, X, Loader2 } from 'lucide-react';
import { useImportProducts, useDownloadImportTemplate, productKeys } from '@services/productsService';
import { useImportProgress } from '@hooks/useImportProgress';
import { useQueryClient } from '@tanstack/react-query';
import { showError } from '@services/notificationService';
import ProductImportResult from '@components/features/products/ProductImportResult';
import { notifyImportResult } from '@components/features/products/importResult';

const ProductImportModal = ({ isOpen, onClose }) => {
  const [file, setFile] = useState(null);
  const [jobId, setJobId] = useState(null);
  const [progress, setProgress] = useState(null);
  const [result, setResult] = useState(null);
  const fileInputRef = useRef(null);

  const queryClient = useQueryClient();
  const importMutation = useImportProducts();
  const downloadTemplate = useDownloadImportTemplate();

  useImportProgress(jobId, {
    onProgress: (data) => setProgress(data),
    onComplete: (data) => {
      setJobId(null);
      setResult(data);
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      notifyImportResult(data);
    },
  });

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    const ext = selected.name.split('.').pop().toLowerCase();
    if (!['xlsx', 'xls'].includes(ext)) {
      showError('Formato inválido', 'Solo se aceptan archivos .xlsx o .xls');
      return;
    }
    setFile(selected);
    setResult(null);
    setProgress(null);
  };

  const handleImport = async () => {
    if (!file) return;
    try {
      const data = await importMutation.mutateAsync(file);
      setJobId(data.data?.job_id);
    } catch (err) {
      showError('Error al importar', err?.response?.data?.message || 'Ocurrió un error al iniciar la importación');
    }
  };

  // Cerrar durante una importación no la cancela: el seguimiento sigue
  // (el modal queda montado en /products) y el resultado llega como toast.
  const handleClose = () => {
    if (!jobId) {
      setFile(null);
      setProgress(null);
      setResult(null);
    }
    onClose();
  };

  const isUploading = importMutation.isPending;

  useEffect(() => {
    if (!isOpen) return undefined;
    const onKeyDown = (e) => {
      if (e.key === 'Escape' && !isUploading) handleClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  });

  const handleDrop = (e) => {
    e.preventDefault();
    const dropped = e.dataTransfer.files?.[0];
    if (dropped) {
      fileInputRef.current.files = e.dataTransfer.files;
      handleFileChange({ target: { files: e.dataTransfer.files } });
    }
  };

  const isImporting = !!jobId || isUploading;
  const progressPercent = progress?.total > 0
    ? Math.round((progress.processed / progress.total) * 100)
    : 0;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={!isUploading ? handleClose : undefined} />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="product-import-title"
        className="relative bg-surface-container border border-outline-variant rounded-xl shadow-2xl w-full max-w-lg"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-outline-variant">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary-container/20 flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 id="product-import-title" className="text-base font-semibold text-on-surface">Importar Productos</h2>
              <p className="text-xs text-secondary">Cargá un archivo Excel con productos</p>
            </div>
          </div>
          <button
            type="button"
            aria-label="Cerrar"
            onClick={handleClose}
            disabled={isUploading}
            className="p-1.5 rounded-md text-secondary hover:text-on-surface hover:bg-surface-container-high transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Download template */}
          <div className="flex items-center justify-between p-3 bg-surface-container-high rounded-lg border border-outline-variant">
            <div>
              <p className="text-sm font-medium text-on-surface">Template de importación</p>
              <p className="text-xs text-secondary">Descargá el formato con las columnas requeridas</p>
            </div>
            <button
              onClick={downloadTemplate}
              disabled={isImporting}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-surface-container border border-outline-variant text-on-surface rounded-lg hover:bg-surface-container-high transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Download className="w-3.5 h-3.5" />
              Descargar
            </button>
          </div>

          {/* Drop zone */}
          {!isImporting && !result && (
            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-outline-variant rounded-lg p-8 text-center cursor-pointer hover:border-primary hover:bg-primary-container/5 transition-colors"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileChange}
                className="hidden"
              />
              {file ? (
                <div className="flex flex-col items-center gap-2">
                  <FileSpreadsheet className="w-10 h-10 text-primary" />
                  <p className="text-sm font-medium text-on-surface">{file.name}</p>
                  <p className="text-xs text-secondary">{(file.size / 1024).toFixed(1)} KB</p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <Upload className="w-10 h-10 text-secondary opacity-50" />
                  <p className="text-sm text-on-surface">Arrastrá tu archivo aquí o hacé click</p>
                  <p className="text-xs text-secondary">Soporta .xlsx y .xls</p>
                </div>
              )}
            </div>
          )}

          {/* Progress */}
          {isImporting && (
            <div className="space-y-3">
              <div role="status" aria-live="polite" className="flex items-center gap-3 p-3 bg-primary-container/10 border border-primary/20 rounded-lg">
                <Loader2 className="w-4 h-4 text-primary animate-spin shrink-0" aria-hidden="true" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-on-surface">
                    {progress
                      ? `Procesando fila ${progress.processed} de ${progress.total}`
                      : 'Iniciando importación...'}
                  </p>
                  {progress && (
                    <p className="text-xs text-secondary mt-0.5">
                      {progress.imported} importados · {progress.errors_count} errores
                    </p>
                  )}
                </div>
                {progress && (
                  <span className="text-sm font-semibold text-primary shrink-0">{progressPercent}%</span>
                )}
              </div>
              {progress?.total > 0 && (
                <div
                  role="progressbar"
                  aria-label="Progreso de la importación"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={progressPercent}
                  className="h-1.5 bg-surface-container-high rounded-full overflow-hidden"
                >
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-200"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              )}
              {jobId && (
                <p className="text-xs text-on-surface-variant">
                  Podés cerrar esta ventana: la importación sigue en el servidor y te avisamos al terminar.
                </p>
              )}
            </div>
          )}

          {/* Result */}
          {result && <ProductImportResult result={result} />}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 pt-0">
          <button
            type="button"
            onClick={handleClose}
            disabled={isUploading}
            className="px-4 py-2 text-sm bg-surface-container-high border border-outline-variant text-on-surface rounded-lg hover:brightness-110 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {result || isImporting ? 'Cerrar' : 'Cancelar'}
          </button>
          {!result && !isImporting && (
            <button
              onClick={handleImport}
              disabled={!file}
              className="flex items-center gap-2 px-4 py-2 text-sm bg-primary-container text-on-primary rounded-lg font-medium hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Upload className="w-4 h-4" />
              Importar
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductImportModal;
