import { useState, useRef } from 'react';
import { Upload, Loader2, Trash2 } from 'lucide-react';
import { uploadImage } from '../lib/imagekit';

interface ImageUploadProps {
    images: string[];
    onImagesChange: (newImages: string[]) => void;
    label?: string;
    maxImages?: number;
}

export function ImageUpload({ images = [], onImagesChange, label = "Imágenes", maxImages = 5 }: ImageUploadProps) {
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        if (images.length + files.length > maxImages) {
            alert(`Máximo ${maxImages} imágenes permitidas.`);
            return;
        }

        setUploading(true);
        try {
            const newUrls: string[] = [];
            for (let i = 0; i < files.length; i++) {
                const url = await uploadImage(files[i]);
                newUrls.push(url);
            }
            onImagesChange([...images, ...newUrls]);
        } catch (error) {
            console.error("Error uploading images:", error);
            alert("Error al subir imágenes. Verifica tu configuración de ImageKit.");
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const removeImage = (indexToRemove: number) => {
        onImagesChange(images.filter((_, index) => index !== indexToRemove));
    };

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <label className="text-xs text-slate-500 uppercase font-medium">{label}</label>
                <span className="text-xs text-slate-400">{images.length}/{maxImages}</span>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                {images.map((url, index) => (
                    <div key={index} className="relative group aspect-square rounded-lg overflow-hidden border border-slate-200 bg-slate-50">
                        <img src={url} alt={`Imagen ${index + 1}`} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <button
                                onClick={() => removeImage(index)}
                                className="p-1.5 bg-white text-rose-500 rounded-full hover:bg-rose-50 transition-colors"
                                title="Eliminar imagen"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                ))}

                {images.length < maxImages && (
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="aspect-square flex flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-slate-200 hover:border-brand/50 hover:bg-brand/5 transition-all text-slate-400 hover:text-brand"
                    >
                        {uploading ? (
                            <Loader2 className="w-6 h-6 animate-spin" />
                        ) : (
                            <>
                                <Upload className="w-6 h-6" />
                                <span className="text-[10px] font-medium uppercase">Subir</span>
                            </>
                        )}
                    </button>
                )}
            </div>

            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                multiple
                className="hidden"
            />
        </div>
    );
}
