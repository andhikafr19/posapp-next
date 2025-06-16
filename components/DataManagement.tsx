// DataManagement component untuk backup, restore, dan export data
'use client';

import React, { useState } from 'react';
import { exportDataToJSON, importDataFromJSON } from '@/utils/storage';

interface DataManagementProps {
  onDataImported?: () => void;
}

export const DataManagement: React.FC<DataManagementProps> = ({ onDataImported }) => {
  const [isImporting, setIsImporting] = useState(false);
  const [importStatus, setImportStatus] = useState<string>('');
  const handleExport = () => {
    try {
      exportDataToJSON();
      setImportStatus('✅ Data berhasil diexport!');
      setTimeout(() => setImportStatus(''), 3000);
    } catch {
      setImportStatus('❌ Export gagal!');
      setTimeout(() => setImportStatus(''), 3000);
    }
  };
  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    setIsImporting(true);
    try {
      await importDataFromJSON(file);
      setImportStatus('✅ Data berhasil diimport!');
      onDataImported?.();
      setTimeout(() => setImportStatus(''), 3000);
    } catch {
      setImportStatus('❌ Import gagal! File tidak valid.');
      setTimeout(() => setImportStatus(''), 3000);
    } finally {
      setIsImporting(false);
      // Reset input
      event.target.value = '';
    }
  };

  return (
    <div className="bg-gray-50 p-4 rounded-lg">
      <h3 className="font-semibold mb-3">📁 Data Management</h3>
      
      <div className="flex flex-col gap-3">
        {/* Export Button */}
        <button
          onClick={handleExport}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
        >
          📤 Export Data (Backup)
        </button>

        {/* Import Section */}
        <div>
          <label className="block">
            <span className="text-sm text-gray-700 mb-1 block">📥 Import Data (Restore):</span>
            <input
              type="file"
              accept=".json"
              onChange={handleImport}
              disabled={isImporting}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100 disabled:opacity-50"
            />
          </label>
          {isImporting && (
            <p className="text-sm text-blue-600 mt-1">⏳ Mengimport data...</p>
          )}
        </div>

        {/* Status Message */}
        {importStatus && (
          <div className={`text-sm p-2 rounded ${
            importStatus.includes('✅') 
              ? 'bg-green-100 text-green-700' 
              : 'bg-red-100 text-red-700'
          }`}>
            {importStatus}
          </div>
        )}

        {/* Info */}
        <div className="text-xs text-gray-600 mt-2 p-2 bg-gray-100 rounded">
          💡 <strong>Tips:</strong>
          <ul className="mt-1 list-disc list-inside">
            <li>Export secara berkala untuk backup data</li>
            <li>File backup berformat JSON</li>
            <li>Import akan mengganti semua data yang ada</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
