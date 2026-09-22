import React, { useState, useRef } from "react";
import { UploadCloud, FileArchive, CheckCircle2, AlertTriangle, ExternalLink, RefreshCw } from "lucide-react";

interface UploadFlowProps {
  repo: string;
  isUploading: boolean;
  onUploadZip: (file: File) => void;
}

export const UploadFlow: React.FC<UploadFlowProps> = ({
  repo,
  isUploading,
  onUploadZip,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.name.endsWith(".zip")) {
        setSelectedFile(file);
      } else {
        alert("Please drop a valid .zip archive");
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
    }
  };

  const handleUpload = () => {
    if (!selectedFile) return;
    onUploadZip(selectedFile);
  };

  return (
    <div className="space-y-6">
      <div className="bg-neutral-50 border border-neutral-200 rounded-2xl p-5 text-sm">
        <h3 className="font-semibold text-neutral-900 text-base">
          Direct ZIP Archive Upload
        </h3>
        <p className="text-neutral-600 mt-1 leading-relaxed">
          You can download the repository directly from GitHub as a ZIP archive and upload it here.
          We will extract the files, install dependencies, and launch the application.
        </p>
        <div className="mt-3">
          <a
            href={`https://github.com/${repo}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-900 bg-white border border-neutral-200 px-3 py-1.5 rounded-lg hover:bg-neutral-50 transition"
          >
            Go to github.com/{repo} &rarr; Click green &ldquo;Code&rdquo; button &rarr; &ldquo;Download ZIP&rdquo;
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition flex flex-col items-center justify-center ${
          dragActive
            ? "border-neutral-900 bg-neutral-50"
            : "border-neutral-300 hover:border-neutral-400 bg-white"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".zip"
          onChange={handleChange}
          className="hidden"
        />

        <div className="w-12 h-12 rounded-2xl bg-neutral-100 flex items-center justify-center text-neutral-600 mb-3">
          {selectedFile ? (
            <FileArchive className="w-6 h-6 text-neutral-900" />
          ) : (
            <UploadCloud className="w-6 h-6" />
          )}
        </div>

        {selectedFile ? (
          <div>
            <p className="text-sm font-semibold text-neutral-900">{selectedFile.name}</p>
            <p className="text-xs text-neutral-500 mt-0.5">
              {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB &bull; Ready to unpack
            </p>
            <p className="text-xs text-neutral-400 mt-2">Click or drop another file to replace</p>
          </div>
        ) : (
          <div>
            <p className="text-sm font-medium text-neutral-800">
              Drag and drop your repository <span className="font-mono text-neutral-900">.zip</span> here, or click to browse
            </p>
            <p className="text-xs text-neutral-400 mt-1">Supports up to 100MB zip files</p>
          </div>
        )}
      </div>

      {selectedFile && (
        <button
          onClick={handleUpload}
          disabled={isUploading}
          className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white font-medium text-sm flex items-center justify-center gap-2.5 shadow-sm transition disabled:opacity-50 cursor-pointer"
        >
          <RefreshCw className={`w-4 h-4 ${isUploading ? "animate-spin" : ""}`} />
          {isUploading ? "Extracting & Installing..." : `Extract & Launch ${selectedFile.name}`}
        </button>
      )}
    </div>
  );
};
