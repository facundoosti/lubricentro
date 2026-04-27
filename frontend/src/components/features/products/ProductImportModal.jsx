import { useState, useRef } from 'react';
import { Upload, Download, FileSpreadsheet, X, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useImportProducts, useDownloadImportTemplate } from '@services/productsService';
import { showSuccess, showError } from '@services/notificationService';

const ProductImportModal = ({ isOpen, onClose }) => {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const fileInputRef = useRef(null);

  const importMutation = useImportProducts();
  const downloadTemplate = useDownloadImportTemplate();

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
  };

  const handleImport = async () => {
    if (!file) return;
    try {
      const data = await importMutation.mutateAsync(file);
      setResult(data.data);
      if (data.data?.imported > 0) {
        showSuccess(`${data.data.imported} producto(s) importados exitosamente`);
      }
    } catch (err) {
      showError('Error al importar', err?.response?.data?.message || 'Ocurrió un error al procesar el archivo');
    }
  };

  const handleClose = () => {
    setFile(null);
    setResult(null);
    onClose();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const dropped = e.dataTransfer.files?.[0];
    if (dropped) {
      fileInputRef.current.files = e.dataTransfer.files;
      handleFileChange({ target: { files: e.dataTransfer.files } });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose} />
      <div className="relative bg-surface-container border border-outline-variant rounded-xl shadow-2xl w-full max-w-lg">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-outline-variant">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary-container/20 flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-on-surface">Importar Productos</h2>
              <p className="text-xs text-secondary">Cargá un archivo Excel con productos</p>
            </div>
          </div>
          <button onClick={handleClose} className="p-1.5 rounded-md text-secondary hover:text-on-surface hover:bg-surface-container-high transition-colors">
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
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-surface-container border border-outline-variant text-on-surface rounded-lg hover:bg-surface-container-high transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              Descargar
            </button>
          </div>

          {/* Drop zone */}
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

          {/* Result */}
          {result && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 p-3 bg-tertiary-container/10 border border-tertiary/20 rounded-lg">
                <CheckCircle className="w-4 h-4 text-tertiary shrink-0" />
                <p className="text-sm text-on-surface">
                  <span className="font-semibold text-tertiary">{result.imported}</span> producto(s) importados correctamente
                </p>
              </div>

              {result.errors?.length > 0 && (
                <div className="p-3 bg-error-container/10 border border-error/20 rounded-lg space-y-1.5">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-error shrink-0" />
                    <p className="text-sm font-medium text-on-error-container">
                      {result.errors.length} fila(s) con errores
                    </p>
                  </div>
                  <ul className="text-xs text-secondary space-y-1 max-h-32 overflow-y-auto">
                    {result.errors.map((e, i) => (
                      <li key={i} className="flex gap-2">
                        <span className="text-error font-mono shrink-0">Fila {e.row}:</span>
                        <span>{e.message}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 pt-0">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-sm bg-surface-container-high border border-outline-variant text-on-surface rounded-lg hover:brightness-110 transition-colors"
          >
            {result ? 'Cerrar' : 'Cancelar'}
          </button>
          {!result && (
            <button
              onClick={handleImport}
              disabled={!file || importMutation.isPending}
              className="flex items-center gap-2 px-4 py-2 text-sm bg-primary-container text-on-primary rounded-lg font-medium hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {importMutation.isPending ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Importando...</>
              ) : (
                <><Upload className="w-4 h-4" /> Importar</>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductImportModal;
