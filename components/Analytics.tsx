'use client';

import React, { useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import { Transaction } from '@/types/pos';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface AnalyticsProps {
  transactions: Transaction[];
}

// Komponen untuk menampilkan analytics penjualan
const Analytics = ({ transactions }: AnalyticsProps) => {
  // Format harga ke Rupiah
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  // Helper function untuk mendapatkan tanggal dalam format YYYY-MM-DD
  const getDateString = (date: Date | string) => {
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      return dateObj.toISOString().split('T')[0];
    } catch {
      return new Date().toISOString().split('T')[0];
    }
  };

  // Helper function untuk mendapatkan label tanggal yang readable
  const getDateLabel = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      const dateStr = date.toISOString().split('T')[0];
      const todayStr = today.toISOString().split('T')[0];
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      if (dateStr === todayStr) return 'Hari Ini';
      if (dateStr === yesterdayStr) return 'Kemarin';
      
      return date.toLocaleDateString('id-ID', { 
        day: 'numeric', 
        month: 'short',
        year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
      });
    } catch {
      return dateString;
    }
  };

  // Data untuk diagram laba harian
  const dailyProfitData = useMemo(() => {
    // Group transaksi berdasarkan tanggal
    const transactionsByDate = transactions.reduce((acc, transaction) => {
      const dateKey = getDateString(transaction.timestamp);
      if (!acc[dateKey]) {
        acc[dateKey] = {
          count: 0,
          revenue: 0,
          profit: 0
        };
      }
      acc[dateKey].count += 1;
      acc[dateKey].revenue += transaction.total;
      
        // Hitung laba berdasarkan HPP yang sebenarnya
        const transactionProfit = transaction.items.reduce((profit, item) => {
          if (item.product.costPrice && item.product.costPrice > 0) {
            // Jika ada HPP, gunakan rumus: Laba = (Harga Jual - HPP) × Quantity
            return profit + ((item.product.price - item.product.costPrice) * item.quantity);
          } else {
            // Jika tidak ada HPP, tidak hitung laba (return 0)
            return profit;
          }
        }, 0);      acc[dateKey].profit += transactionProfit;
      return acc;
    }, {} as Record<string, { count: number; revenue: number; profit: number }>);

    // Dapatkan 7 hari terakhir
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      last7Days.push(date.toISOString().split('T')[0]);
    }

    const labels = last7Days.map(getDateLabel);
    const revenues = last7Days.map(date => transactionsByDate[date]?.revenue || 0);
    const profits = last7Days.map(date => transactionsByDate[date]?.profit || 0);

    return {
      labels,
      datasets: [
        {
          label: 'Pendapatan (Rp)',
          data: revenues,
          borderColor: 'rgb(16, 185, 129)',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          tension: 0.3,
          fill: true,
          yAxisID: 'y',
        },
        {
          label: 'Laba Berdasarkan HPP (Rp)',
          data: profits,
          borderColor: 'rgb(245, 158, 11)',
          backgroundColor: 'rgba(245, 158, 11, 0.1)',
          tension: 0.3,
          fill: true,
          yAxisID: 'y',
        }
      ]
    };
  }, [transactions]);
  const dailyTransactionData = useMemo(() => {
    // Group transaksi berdasarkan tanggal
    const transactionsByDate = transactions.reduce((acc, transaction) => {
      const dateKey = getDateString(transaction.timestamp);
      if (!acc[dateKey]) {
        acc[dateKey] = {
          count: 0,
          total: 0
        };
      }
      acc[dateKey].count += 1;
      acc[dateKey].total += transaction.total;
      return acc;
    }, {} as Record<string, { count: number; total: number }>);

    // Dapatkan 7 hari terakhir
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      last7Days.push(date.toISOString().split('T')[0]);
    }

    const labels = last7Days.map(getDateLabel);
    const transactionCounts = last7Days.map(date => transactionsByDate[date]?.count || 0);
    const totalSales = last7Days.map(date => transactionsByDate[date]?.total || 0);

    return {
      labels,
      datasets: [
        {
          label: 'Jumlah Transaksi',
          data: transactionCounts,
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.3,
          fill: true,
          yAxisID: 'y',
        },
        {
          label: 'Total Penjualan (Rp)',
          data: totalSales,
          borderColor: 'rgb(16, 185, 129)',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          tension: 0.3,
          fill: true,
          yAxisID: 'y1',
        }
      ]
    };
  }, [transactions]);

  // Data untuk diagram batang produk terlaris
  const topProductsData = useMemo(() => {
    // Hitung total quantity untuk setiap produk
    const productSales = transactions.reduce((acc, transaction) => {
      transaction.items.forEach(item => {
        const productName = item.product.name;
        if (!acc[productName]) {
          acc[productName] = {
            quantity: 0,
            revenue: 0
          };
        }
        acc[productName].quantity += item.quantity;
        acc[productName].revenue += item.product.price * item.quantity;
      });
      return acc;
    }, {} as Record<string, { quantity: number; revenue: number }>);

    // Sort dan ambil top 10
    const sortedProducts = Object.entries(productSales)
      .sort(([, a], [, b]) => b.quantity - a.quantity)
      .slice(0, 10);

    const labels = sortedProducts.map(([name]) => name);
    const quantities = sortedProducts.map(([, data]) => data.quantity);
    const revenues = sortedProducts.map(([, data]) => data.revenue);

    return {
      labels,
      datasets: [
        {
          label: 'Jumlah Terjual',
          data: quantities,
          backgroundColor: 'rgba(59, 130, 246, 0.8)',
          borderColor: 'rgb(59, 130, 246)',
          borderWidth: 1,
          yAxisID: 'y',
        },
        {
          label: 'Pendapatan (Rp)',
          data: revenues,
          backgroundColor: 'rgba(16, 185, 129, 0.8)',
          borderColor: 'rgb(16, 185, 129)',
          borderWidth: 1,
          yAxisID: 'y1',
        }
      ]
    };
  }, [transactions]);

  // Options untuk profit chart
  const profitChartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Tren Pendapatan vs Laba Berdasarkan HPP - 7 Hari Terakhir',
        font: {
          size: 16,
          weight: 'bold'
        }
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.dataset.label || '';
            return `${label}: ${formatPrice(context.parsed.y)}`;
          }
        }
      }
    },
    scales: {
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        title: {
          display: true,
          text: 'Rupiah (Rp)'
        },
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return formatPrice(value as number);
          }
        }
      },
    },
  };
  const lineChartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Tren Penjualan 7 Hari Terakhir',
        font: {
          size: 16,
          weight: 'bold'
        }
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.dataset.label || '';
            if (label.includes('Penjualan')) {
              return `${label}: ${formatPrice(context.parsed.y)}`;
            }
            return `${label}: ${context.parsed.y}`;
          }
        }
      }
    },
    scales: {
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        title: {
          display: true,
          text: 'Jumlah Transaksi'
        },
        beginAtZero: true,
      },
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        title: {
          display: true,
          text: 'Total Penjualan (Rp)'
        },
        beginAtZero: true,
        grid: {
          drawOnChartArea: false,
        },
        ticks: {
          callback: function(value) {
            return formatPrice(value as number);
          }
        }
      },
    },
  };

  // Options untuk bar chart
  const barChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Top 10 Produk Terlaris',
        font: {
          size: 16,
          weight: 'bold'
        }
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.dataset.label || '';
            if (label.includes('Pendapatan')) {
              return `${label}: ${formatPrice(context.parsed.y)}`;
            }
            return `${label}: ${context.parsed.y}`;
          }
        }
      }
    },
    scales: {
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        title: {
          display: true,
          text: 'Jumlah Terjual'
        },
        beginAtZero: true,
      },
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        title: {
          display: true,
          text: 'Pendapatan (Rp)'
        },
        beginAtZero: true,
        grid: {
          drawOnChartArea: false,
        },
        ticks: {
          callback: function(value) {
            return formatPrice(value as number);
          }
        }
      },
    },
  };

  // Statistik ringkasan dengan profit calculation berdasarkan HPP
  const stats = useMemo(() => {
    const totalTransactions = transactions.length;
    const totalRevenue = transactions.reduce((sum, t) => sum + t.total, 0);
    const avgTransactionValue = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;
    
    const today = new Date().toISOString().split('T')[0];
    const todayTransactions = transactions.filter(t => getDateString(t.timestamp) === today);
    const todayRevenue = todayTransactions.reduce((sum, t) => sum + t.total, 0);

    // Hitung profit berdasarkan HPP yang sebenarnya
    const totalProfit = transactions.reduce((profit, transaction) => {
      return profit + transaction.items.reduce((itemProfit, item) => {
        if (item.product.costPrice && item.product.costPrice > 0) {
          // Jika ada HPP, gunakan rumus: Laba = (Harga Jual - HPP) × Quantity
          return itemProfit + ((item.product.price - item.product.costPrice) * item.quantity);
        } else {
          // Jika tidak ada HPP, tidak hitung laba
          return itemProfit;
        }
      }, 0);
    }, 0);

    const todayProfit = todayTransactions.reduce((profit, transaction) => {
      return profit + transaction.items.reduce((itemProfit, item) => {
        if (item.product.costPrice && item.product.costPrice > 0) {
          return itemProfit + ((item.product.price - item.product.costPrice) * item.quantity);
        } else {
          return itemProfit;
        }
      }, 0);
    }, 0);

    const avgProfitPerTransaction = totalTransactions > 0 ? totalProfit / totalTransactions : 0;

    return {
      totalTransactions,
      totalRevenue,
      avgTransactionValue,
      todayTransactions: todayTransactions.length,
      todayRevenue,
      estimatedProfit: totalProfit,
      todayProfit,
      avgProfitPerTransaction
    };
  }, [transactions]);

  if (transactions.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8">
        <div className="text-center">
          <div className="text-4xl mb-4">📊</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Belum Ada Data Analytics
          </h3>
          <p className="text-gray-500">
            Lakukan beberapa transaksi untuk melihat analytics penjualan
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          📊 Analytics Penjualan
        </h2>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="text-sm font-medium text-blue-700">Total Transaksi</div>
            <div className="text-2xl font-bold text-blue-900">{stats.totalTransactions}</div>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="text-sm font-medium text-green-700">Total Pendapatan</div>
            <div className="text-lg font-bold text-green-900">{formatPrice(stats.totalRevenue)}</div>
          </div>
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="text-sm font-medium text-purple-700">Rata-rata/Transaksi</div>
            <div className="text-lg font-bold text-purple-900">{formatPrice(stats.avgTransactionValue)}</div>
          </div>
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="text-sm font-medium text-orange-700">Transaksi Hari Ini</div>
            <div className="text-2xl font-bold text-orange-900">{stats.todayTransactions}</div>
          </div>
          <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
            <div className="text-sm font-medium text-teal-700">Pendapatan Hari Ini</div>
            <div className="text-lg font-bold text-teal-900">{formatPrice(stats.todayRevenue)}</div>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="text-sm font-medium text-yellow-700">Laba Berdasarkan HPP</div>
            <div className="text-lg font-bold text-yellow-900">{formatPrice(stats.estimatedProfit)}</div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Line Chart - Tren Penjualan */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="h-80">
            <Line data={dailyTransactionData} options={lineChartOptions} />
          </div>
        </div>

        {/* Line Chart - Tren Laba */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="h-80">
            <Line data={dailyProfitData} options={profitChartOptions} />
          </div>
        </div>
      </div>

      {/* Bar Chart - Produk Terlaris (Full Width) */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="h-80">
          <Bar data={topProductsData} options={barChartOptions} />
        </div>
      </div>

      {/* Profit Analysis & Additional Insights */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Profit Analysis */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">� Analisis Laba Detil</h3>
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 border border-yellow-200 rounded-lg p-4">
              <h4 className="font-semibold text-yellow-800 mb-2">Total Laba Berdasarkan HPP</h4>
              <p className="text-2xl font-bold text-yellow-900">{formatPrice(stats.estimatedProfit)}</p>
              <p className="text-sm text-yellow-700 mt-1">
                Dari total pendapatan {formatPrice(stats.totalRevenue)} menggunakan HPP yang sebenarnya
              </p>
            </div>
            
            <div className="bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-lg p-4">
              <h4 className="font-semibold text-green-800 mb-2">Laba Hari Ini</h4>
              <p className="text-xl font-bold text-green-900">{formatPrice(stats.todayProfit)}</p>
              <p className="text-sm text-green-700 mt-1">
                {stats.todayTransactions > 0 
                  ? `Dari ${stats.todayTransactions} transaksi hari ini`
                  : 'Belum ada transaksi hari ini'
                }
              </p>
            </div>

            <div className="bg-gradient-to-r from-purple-50 to-purple-100 border border-purple-200 rounded-lg p-4">
              <h4 className="font-semibold text-purple-800 mb-2">Rata-rata Laba per Transaksi</h4>
              <p className="text-xl font-bold text-purple-900">{formatPrice(stats.avgProfitPerTransaction)}</p>
              <p className="text-sm text-purple-700 mt-1">
                Laba per transaksi berdasarkan HPP dan margin fallback
              </p>
            </div>

            {/* HPP Efficiency Information */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-700 mb-3">💡 Informasi HPP</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between p-2 rounded bg-blue-50">
                  <span>Margin Aktual (dari HPP):</span>
                  <span className="font-semibold">
                    {stats.totalRevenue > 0 
                      ? `${((stats.estimatedProfit / stats.totalRevenue) * 100).toFixed(1)}%`
                      : '0%'
                    }
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Margin dihitung dari HPP produk yang sebenarnya. 
                  Produk tanpa HPP tidak berkontribusi pada perhitungan laba.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Insights */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">💡 Insights</h3>
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-700 mb-2">Performa Hari Ini</h4>
              <p className="text-gray-600 text-sm">
                {stats.todayTransactions > 0 
                  ? `Sudah ada ${stats.todayTransactions} transaksi dengan total ${formatPrice(stats.todayRevenue)} dan estimasi laba ${formatPrice(stats.todayProfit)}`
                  : 'Belum ada transaksi hari ini'
                }
              </p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-700 mb-2">Rata-rata Nilai Transaksi</h4>
              <p className="text-gray-600 text-sm">
                Setiap transaksi rata-rata bernilai {formatPrice(stats.avgTransactionValue)} dengan estimasi laba {formatPrice(stats.avgProfitPerTransaction)}
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-700 mb-2">Rekomendasi</h4>
              <p className="text-gray-600 text-sm">
                {(() => {
                  const actualMargin = stats.totalRevenue > 0 ? (stats.estimatedProfit / stats.totalRevenue) * 100 : 0;
                  if (actualMargin < 20) {
                    return "Margin laba aktual masih rendah. Pertimbangkan untuk menaikkan harga jual atau mencari supplier dengan HPP lebih rendah.";
                  } else if (actualMargin > 40) {
                    return "Margin laba sangat baik! Pastikan kualitas produk tetap terjaga dan harga tetap kompetitif.";
                  } else {
                    return "Margin laba berada di range yang sehat untuk bisnis retail sembako.";
                  }
                })()}
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-700 mb-2">📈 Target Laba Bulanan</h4>
              <p className="text-blue-600 text-sm">
                Jika tren saat ini berlanjut, estimasi laba bulanan: {formatPrice(stats.todayProfit * 30)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
