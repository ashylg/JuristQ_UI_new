import { useState, useCallback } from "react";
import { Upload, X, FileText, AlertCircle, File, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface FileUploadProps {
    onFileSelect: (file: File) => void;
    currentTier: "basic" | "pro" | "ultra" | "mega";
    isUploading: boolean;
}

const TIER_LIMITS = {
    basic: { max: 0, label: "No uploads" },
    pro: { max: 5 * 1024 * 1024, label: "5MB" },
    ultra: { max: 25 * 1024 * 1024, label: "25MB" },
    mega: { max: 1024 * 1024 * 1024, label: "1GB" } // Effectively unlimited
};

export function FileUpload({ onFileSelect, currentTier, isUploading }: FileUploadProps) {
    const [dragActive, setDragActive] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [error, setError] = useState<string | null>(null);

    const limit = TIER_LIMITS[currentTier];

    const handleFile = useCallback((file: File) => {
        if (limit.max === 0) {
            setError(`Uploads not available on ${currentTier} tier`);
            return;
        }
        if (file.size > limit.max) {
            setError(`File too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Limit: ${limit.label}`);
            return;
        }
        setError(null);
        setSelectedFile(file);
        onFileSelect(file);
    }, [currentTier, limit, onFileSelect]);

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
        }
    };

    const clearFile = () => {
        setSelectedFile(null);
        setError(null);
    };

    return (
        <div className="w-full">
            {!selectedFile ? (
                <div
                    className={cn(
                        "relative border-2 border-dashed rounded-lg p-4 transition-colors text-center cursor-pointer",
                        dragActive ? "border-accent bg-accent/5" : "border-border hover:border-accent/50",
                        error ? "border-red-500/50 bg-red-500/5" : ""
                    )}
                    onDragEnter={(e) => { e.preventDefault(); setDragActive(true); }}
                    onDragLeave={(e) => { e.preventDefault(); setDragActive(false); }}
                    onDragOver={(e) => { e.preventDefault(); }}
                    onDrop={handleDrop}
                >
                    <input
                        type="file"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        onChange={handleChange}
                        accept=".pdf,.docx,.txt"
                        disabled={isUploading}
                    />
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <Upload className="h-6 w-6" />
                        <div className="text-xs">
                            <span className="font-semibold text-foreground">Click to upload</span> or drag and drop
                        </div>
                        <div className="text-[10px] uppercase tracking-wider opacity-70">
                            Max size: {limit.label} ({currentTier})
                        </div>
                    </div>
                </div>
            ) : (
                <div className="relative flex items-center gap-3 p-3 bg-muted/50 rounded-lg border border-border">
                    <div className="h-10 w-10 rounded bg-background flex items-center justify-center border border-border/50">
                        {isUploading ? (
                            <Loader2 className="h-5 w-5 animate-spin text-accent" />
                        ) : (
                            <FileText className="h-5 w-5 text-accent" />
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">{selectedFile.name}</div>
                        <div className="text-xs text-muted-foreground">
                            {(selectedFile.size / 1024).toFixed(1)} KB
                        </div>
                    </div>
                    {!isUploading && (
                        <button
                            onClick={clearFile}
                            className="p-1 hover:bg-background rounded transition-colors"
                        >
                            <X className="h-4 w-4 text-muted-foreground" />
                        </button>
                    )}
                </div>
            )}

            {error && (
                <div className="flex items-center gap-2 mt-2 text-xs text-red-400">
                    <AlertCircle className="h-3 w-3" />
                    <span>{error}</span>
                </div>
            )}
        </div>
    );
}
