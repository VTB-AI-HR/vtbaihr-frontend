import { useState } from "react";

interface FileUploadProps {
  onFileSelect: (file: File) => void;
}

export default function createVacancy({ onFileSelect }: FileUploadProps) {
  const [fileName, setFileName] = useState<string>("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      onFileSelect(file);
    }
  };

  return (
    <div className="p-4 border-2 border-dashed rounded-2xl text-center">
      <label className="cursor-pointer">
        <input
          type="file"
          accept=".rtf,.txt,.pdf,.doc,.docx"
          onChange={handleFileChange}
          className="hidden"
        />
        <span className="block p-2 bg-gray-200 rounded-lg">
          Upload Vacancy File
        </span>
      </label>
      {fileName && (
        <p className="mt-2 text-sm text-gray-600">Selected: {fileName}</p>
      )}
    </div>
  );
}

