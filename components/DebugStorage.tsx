// Debug utility untuk mengatasi masalah localStorage
'use client';

import React from 'react';

export const DebugStorage: React.FC = () => {  const clearAllData = () => {
    try {
      localStorage.removeItem('pos_products');
      localStorage.removeItem('pos_transactions');
      localStorage.removeItem('pos_settings');
      alert('✅ Semua data berhasil dihapus! Refresh halaman untuk reset.');
      window.location.reload();
    } catch {
      alert('❌ Gagal menghapus data!');
    }
  };

  const checkStorageData = () => {
    try {
      const products = localStorage.getItem('pos_products');
      const transactions = localStorage.getItem('pos_transactions');
      const settings = localStorage.getItem('pos_settings');
      
      console.log('🔍 Storage Debug:');
      console.log('Products:', products ? JSON.parse(products) : 'null');
      console.log('Transactions:', transactions ? JSON.parse(transactions) : 'null');
      console.log('Settings:', settings ? JSON.parse(settings) : 'null');
      
      alert('✅ Data dicetak ke console. Buka Developer Tools untuk melihat detail.');
    } catch (error) {
      console.error('Error checking storage:', error);
      alert('❌ Error checking storage data!');
    }
  };

  const fixTransactionDates = () => {
    try {
      const stored = localStorage.getItem('pos_transactions');
      if (!stored) {
        alert('⚠️ Tidak ada data transaksi untuk diperbaiki.');
        return;
      }      const transactions = JSON.parse(stored);
      const fixedTransactions = transactions.map((transaction: { timestamp: string | Date }) => ({
        ...transaction,
        timestamp: new Date(transaction.timestamp).toISOString()
      }));

      localStorage.setItem('pos_transactions', JSON.stringify(fixedTransactions));
      alert('✅ Format tanggal transaksi berhasil diperbaiki! Refresh halaman.');
      window.location.reload();
    } catch (error) {
      console.error('Error fixing dates:', error);
      alert('❌ Gagal memperbaiki format tanggal!');
    }
  };

  return (
    <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
      <h4 className="font-semibold text-yellow-800 mb-3">🛠️ Debug Tools</h4>
      <div className="space-y-2">
        <button
          onClick={checkStorageData}
          className="block w-full bg-blue-500 text-white px-3 py-2 rounded text-sm hover:bg-blue-600"
        >
          🔍 Check Storage Data
        </button>
        <button
          onClick={fixTransactionDates}
          className="block w-full bg-green-500 text-white px-3 py-2 rounded text-sm hover:bg-green-600"
        >
          🔧 Fix Transaction Dates
        </button>
        <button
          onClick={clearAllData}
          className="block w-full bg-red-500 text-white px-3 py-2 rounded text-sm hover:bg-red-600"
        >
          🗑️ Clear All Data
        </button>
      </div>
      <p className="text-xs text-yellow-700 mt-2">
        ⚠️ Gunakan tools ini jika mengalami error pada riwayat transaksi.
      </p>
    </div>
  );
};
