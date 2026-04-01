import { useState, useRef } from 'react';
import { Upload, X, ImageIcon } from 'lucide-react';

const ImageUpload = ({
  currentUrl = null,
  onChange,
  label = 'Imagen',
  accept = 'image/*',
}) => {
  const [preview, setPreview] = useState(null);
  const [removed, setRemoved] = useState(false);
  const inputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (preview) URL.revokeObjectURL(preview);
    setPreview(URL.createObjectURL(file));
    setRemoved(false);
    onChange(file);
  };

  const handleRemove = () => {
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
    setRemoved(true);
    onChange(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  const displayUrl = preview || (!removed ? currentUrl : null);

  return (
    <div>
      <label className="block text-sm font-medium text-on-surface-variant mb-2">
        {label}
      </label>
      <div className="flex items-center gap-3">
        {displayUrl ? (
          <div className="relative w-20 h-20 rounded-lg overflow-hidden border border-outline-variant flex-shrink-0">
            <img src={displayUrl} alt="" className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={handleRemove}
              className="absolute top-1 right-1 w-5 h-5 bg-error rounded-full flex items-center justify-center hover:brightness-110 transition-all"
              title="Eliminar imagen"
            >
              <X className="w-3 h-3 text-white" />
            </button>
          </div>
        ) : (
          <div className="w-20 h-20 rounded-lg border border-outline-variant bg-surface-container flex items-center justify-center flex-shrink-0">
            <ImageIcon className="w-7 h-7 text-secondary" />
          </div>
        )}

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex items-center gap-2 px-3 py-2 rounded-lg border border-outline-variant bg-surface-container-high text-on-surface-variant text-sm hover:border-primary hover:text-primary transition-colors"
        >
          <Upload className="w-4 h-4" />
          {displayUrl ? 'Cambiar imagen' : 'Subir imagen'}
        </button>

        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={handleFileChange}
          className="hidden"
        />
      </div>
    </div>
  );
};

export default ImageUpload;
