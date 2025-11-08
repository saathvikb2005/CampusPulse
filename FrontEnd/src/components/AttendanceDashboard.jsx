import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
} from 'chart.js';
import { Bar, Line, Doughnut, Pie } from 'react-chartjs-2';
import { api } from '../services/api';
import './AttendanceDashboard.css';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
);

const AttendanceDashboard = ({ eventId, refreshInterval = 30000 }) => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [selectedTimeRange, setSelectedTimeRange] = useState('1h');
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    loadDashboardData();
    
    let interval;
    if (autoRefresh) {
      interval = setInterval(() => {
        refreshDashboardData();
      }, refreshInterval);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [eventId, autoRefresh, refreshInterval, selectedTimeRange]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await api.get(`/api/qr-validation/attendance-dashboard/${eventId}`, {
        params: { timeRange: selectedTimeRange }
      });
      
      setDashboardData(response.data.data);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setError(error.response?.data?.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const refreshDashboardData = async () => {
    try {
      setRefreshing(true);
      
      const response = await api.get(`/api/qr-validation/attendance-dashboard/${eventId}`, {
        params: { timeRange: selectedTimeRange }
      });
      
      setDashboardData(response.data.data);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error refreshing dashboard data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const getAttendanceOverviewChart = () => {
    if (!dashboardData?.overview) return null;
    
    const { overview } = dashboardData;
    
    return {
      labels: ['Registered', 'Checked In', 'Pending'],
      datasets: [{
        label: 'Attendance Overview',
        data: [
          overview.totalRegistered,
          overview.checkedIn,
          overview.totalRegistered - overview.checkedIn
        ],
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(34, 197, 94, 0.8)',
          'rgba(156, 163, 175, 0.8)'
        ],
        borderColor: [
          'rgba(59, 130, 246, 1)',
          'rgba(34, 197, 94, 1)',
          'rgba(156, 163, 175, 1)'
        ],
        borderWidth: 2
      }]
    };
  };

  const getCheckInTrendChart = () => {
    if (!dashboardData?.timeline) return null;
    
    const { timeline } = dashboardData;
    
    return {
      labels: timeline.map(point => 
        new Date(point.timestamp).toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit'
        })
      ),
      datasets: [{
        label: 'Check-ins Over Time',
        data: timeline.map(point => point.count),
        fill: true,
        borderColor: 'rgba(34, 197, 94, 1)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        tension: 0.4,
        pointBackgroundColor: 'rgba(34, 197, 94, 1)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6
      }]
    };
  };

  const getTicketStatusChart = () => {
    if (!dashboardData?.ticketBreakdown) return null;
    
    const { ticketBreakdown } = dashboardData;
    
    return {
      labels: Object.keys(ticketBreakdown),
      datasets: [{
        data: Object.values(ticketBreakdown),
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(156, 163, 175, 0.8)'
        ],
        borderColor: [
          'rgba(34, 197, 94, 1)',
          'rgba(59, 130, 246, 1)',
          'rgba(239, 68, 68, 1)',
          'rgba(156, 163, 175, 1)'
        ],
        borderWidth: 2
      }]
    };
  };

  const getLocationBreakdownChart = () => {
    if (!dashboardData?.locationStats) return null;
    
    const { locationStats } = dashboardData;
    
    return {
      labels: locationStats.map(stat => stat.location || 'Unknown'),
      datasets: [{
        label: 'Check-ins by Location',
        data: locationStats.map(stat => stat.count),
        backgroundColor: 'rgba(99, 102, 241, 0.8)',
        borderColor: 'rgba(99, 102, 241, 1)',
        borderWidth: 2,
        borderRadius: 5
      }]
    };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12,
            weight: '600'
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        cornerRadius: 8,
        padding: 12
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        },
        ticks: {
          font: {
            size: 11
          }
        }
      },
      x: {
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        },
        ticks: {
          font: {
            size: 11
          }
        }
      }
    }
  };

  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12,
            weight: '600'
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        cornerRadius: 8,
        padding: 12
      }
    }
  };

  const formatPercentage = (value, total) => {
    return total > 0 ? `${((value / total) * 100).toFixed(1)}%` : '0%';
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  if (loading) {
    return (
      <div className="attendance-dashboard">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading attendance dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="attendance-dashboard">
        <div className="error-container">
          <div className="error-icon">⚠️</div>
          <h3>Dashboard Error</h3>
          <p>{error}</p>
          <button onClick={loadDashboardData} className="retry-button">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="attendance-dashboard">
        <div className="no-data-container">
          <div className="no-data-icon">📊</div>
          <h3>No Data Available</h3>
          <p>Attendance data will appear here once check-ins begin.</p>
        </div>
      </div>
    );
  }

  const { overview, timeline, recentScans } = dashboardData;

  return (
    <div className="attendance-dashboard">
      {/* Dashboard Header */}
      <div className="dashboard-header">
        <div className="header-content">
          <h2>📊 Attendance Dashboard</h2>
          <div className="header-controls">
            <select 
              value={selectedTimeRange} 
              onChange={(e) => setSelectedTimeRange(e.target.value)}
              className="time-range-select"
            >
              <option value="15m">Last 15 minutes</option>
              <option value="1h">Last hour</option>
              <option value="4h">Last 4 hours</option>
              <option value="1d">Today</option>
              <option value="all">All time</option>
            </select>
            
            <button 
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`auto-refresh-button ${autoRefresh ? 'active' : ''}`}
            >
              {autoRefresh ? '🔄 Auto' : '⏸️ Manual'}
            </button>
            
            <button 
              onClick={refreshDashboardData}
              className="refresh-button"
              disabled={refreshing}
            >
              {refreshing ? '🔄' : '↻'} Refresh
            </button>
          </div>
        </div>
        
        {lastUpdated && (
          <div className="last-updated">
            Last updated: {formatTimestamp(lastUpdated)}
          </div>
        )}
      </div>

      {/* Key Metrics */}
      <div className="metrics-grid">
        <div className="metric-card primary">
          <div className="metric-icon">👥</div>
          <div className="metric-content">
            <div className="metric-value">{overview?.totalRegistered || 0}</div>
            <div className="metric-label">Total Registered</div>
          </div>
        </div>
        
        <div className="metric-card success">
          <div className="metric-icon">✅</div>
          <div className="metric-content">
            <div className="metric-value">{overview?.checkedIn || 0}</div>
            <div className="metric-label">Checked In</div>
            <div className="metric-percentage">
              {formatPercentage(overview?.checkedIn || 0, overview?.totalRegistered || 0)}
            </div>
          </div>
        </div>
        
        <div className="metric-card warning">
          <div className="metric-icon">⏳</div>
          <div className="metric-content">
            <div className="metric-value">
              {(overview?.totalRegistered || 0) - (overview?.checkedIn || 0)}
            </div>
            <div className="metric-label">Pending</div>
            <div className="metric-percentage">
              {formatPercentage(
                (overview?.totalRegistered || 0) - (overview?.checkedIn || 0),
                overview?.totalRegistered || 0
              )}
            </div>
          </div>
        </div>
        
        <div className="metric-card info">
          <div className="metric-icon">🔍</div>
          <div className="metric-content">
            <div className="metric-value">{overview?.totalScans || 0}</div>
            <div className="metric-label">Total Scans</div>
            <div className="metric-sublabel">
              {(overview?.invalidScans || 0)} invalid
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="charts-grid">
        {/* Attendance Overview */}
        <div className="chart-container">
          <div className="chart-header">
            <h3>📈 Attendance Overview</h3>
          </div>
          <div className="chart-content">
            {getAttendanceOverviewChart() && (
              <Doughnut 
                data={getAttendanceOverviewChart()} 
                options={pieChartOptions}
              />
            )}
          </div>
        </div>

        {/* Check-in Timeline */}
        <div className="chart-container wide">
          <div className="chart-header">
            <h3>⏰ Check-in Timeline</h3>
          </div>
          <div className="chart-content">
            {getCheckInTrendChart() && (
              <Line 
                data={getCheckInTrendChart()} 
                options={chartOptions}
              />
            )}
          </div>
        </div>

        {/* Ticket Status Breakdown */}
        <div className="chart-container">
          <div className="chart-header">
            <h3>🎫 Ticket Status</h3>
          </div>
          <div className="chart-content">
            {getTicketStatusChart() && (
              <Pie 
                data={getTicketStatusChart()} 
                options={pieChartOptions}
              />
            )}
          </div>
        </div>

        {/* Location Breakdown */}
        {dashboardData.locationStats && dashboardData.locationStats.length > 0 && (
          <div className="chart-container wide">
            <div className="chart-header">
              <h3>📍 Check-ins by Location</h3>
            </div>
            <div className="chart-content">
              {getLocationBreakdownChart() && (
                <Bar 
                  data={getLocationBreakdownChart()} 
                  options={chartOptions}
                />
              )}
            </div>
          </div>
        )}
      </div>

      {/* Recent Activity */}
      {recentScans && recentScans.length > 0 && (
        <div className="recent-activity">
          <div className="activity-header">
            <h3>🕐 Recent Check-ins</h3>
            <span className="activity-count">
              Last {recentScans.length} scans
            </span>
          </div>
          
          <div className="activity-list">
            {recentScans.map((scan, index) => (
              <div key={index} className={`activity-item ${scan.valid ? 'valid' : 'invalid'}`}>
                <div className="activity-icon">
                  {scan.valid ? '✅' : '❌'}
                </div>
                <div className="activity-content">
                  <div className="activity-main">
                    <span className="ticket-code">{scan.ticketCode}</span>
                    <span className="user-name">{scan.userName}</span>
                  </div>
                  <div className="activity-details">
                    <span className="scan-time">
                      {new Date(scan.scannedAt).toLocaleTimeString()}
                    </span>
                    <span className="scan-status">{scan.reason}</span>
                  </div>
                </div>
                <div className="activity-type">
                  {scan.isDuplicate && <span className="duplicate-badge">Duplicate</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Event Status Summary */}
      <div className="event-summary">
        <h3>📋 Event Summary</h3>
        <div className="summary-grid">
          <div className="summary-item">
            <strong>Attendance Rate:</strong>
            <span className={`rate ${
              ((overview?.checkedIn || 0) / (overview?.totalRegistered || 1)) > 0.8 ? 'high' :
              ((overview?.checkedIn || 0) / (overview?.totalRegistered || 1)) > 0.5 ? 'medium' : 'low'
            }`}>
              {formatPercentage(overview?.checkedIn || 0, overview?.totalRegistered || 0)}
            </span>
          </div>
          
          <div className="summary-item">
            <strong>Scan Accuracy:</strong>
            <span className={`rate ${
              ((overview?.validScans || 0) / (overview?.totalScans || 1)) > 0.9 ? 'high' :
              ((overview?.validScans || 0) / (overview?.totalScans || 1)) > 0.7 ? 'medium' : 'low'
            }`}>
              {formatPercentage(overview?.validScans || 0, overview?.totalScans || 0)}
            </span>
          </div>
          
          <div className="summary-item">
            <strong>Peak Check-in Time:</strong>
            <span>{overview?.peakTime || 'N/A'}</span>
          </div>
          
          <div className="summary-item">
            <strong>Average Check-in Rate:</strong>
            <span>{overview?.avgCheckInRate || 0} per minute</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendanceDashboard;