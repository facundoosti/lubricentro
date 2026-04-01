import { useState, useRef } from 'react';
import { Plus, X, ImageIcon } from 'lucide-react';

const PhotosUpload = ({
  currentUrls = [],
  onChange,
  label = 'Fotos',
  maxPhotos = 10,
}) => {
  const [newFiles, setNewFiles] = useState([]); // [{ file: File, preview: string }]
  const inputRef = useRef(null);

  const totalCount = currentUrls.length + newFiles.length;
  const canAddMore = totalCount < maxPhotos;

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    const entries = files
      .slice(0, maxPhotos - totalCount)
      .map((file) => ({ file, preview: URL.createObjectURL(file) }));

    const updated = [...newFiles, ...entries];
    setNewFiles(updated);
    onChange(updated.map((e) => e.file));
    if (inputRef.current) inputRef.current.value = '';
  };

  const removeNewFile = (index) => {
    URL.revokeObjectURL(newFiles[index].preview);
    const updated = newFiles.filter((_, i) => i !== index);
    setNewFiles(updated);
    onChange(updated.map((e) => e.file));
  };

  return (
    <div>
      <label className="block text-sm font-medium text-on-surface-variant mb-2">
        {label}
        <span className="ml-2 text-xs text-secondary font-normal">
          ({totalCount}/{maxPhotos})
        </span>
      </label>

      <div className="grid grid-cols-4 gap-2">
        {/* Existing photos (read-only) */}
        {currentUrls.map((url) => (
          <div
            key={url}
            className="relative aspect-square rounded-lg overflow-hidden border border-outline-variant"
          >
            <img src={url} alt="" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/20" />
          </div>
        ))}

        {/* New files with preview */}
        {newFiles.map((entry, i) => (
          <div
            key={i}
            className="relative aspect-square rounded-lg overflow-hidden border border-primary/50"
          >
            <img src={entry.preview} alt="" className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => removeNewFile(i)}
              className="absolute top-1 right-1 w-5 h-5 bg-error rounded-full flex items-center justify-center hover:brightness-110 transition-all"
            >
              <X className="w-3 h-3 text-white" />
            </button>
          </div>
        ))}

        {/* Add button */}
        {canAddMore && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="aspect-square rounded-lg border-2 border-dashed border-outline-variant flex flex-col items-center justify-center gap-1 hover:border-primary hover:text-primary text-secondary transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span className="text-xs">Agregar</span>
          </button>
        )}

        {/* Empty state */}
        {totalCount === 0 && !canAddMore && (
          <div className="col-span-4 flex flex-col items-center justify-center py-6 text-secondary gap-2">
            <ImageIcon className="w-8 h-8" />
            <span className="text-sm">Sin fotos</span>
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        multiple
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
};

export default PhotosUpload;
