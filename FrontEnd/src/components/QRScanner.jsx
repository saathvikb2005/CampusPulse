import React, { useState, useRef, useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { api } from '../services/api';
import './QRScanner.css';

const QRScanner = ({ eventId, onScanResult, mode = 'validation' }) => {
  const [scanResult, setScanResult] = useState('');
  const [scanning, setScanning] = useState(false);
  const [facingMode, setFacingMode] = useState('environment');
  const [error, setError] = useState('');
  const [validationResult, setValidationResult] = useState(null);
  const [lastScanTime, setLastScanTime] = useState(0);
  const audioRef = useRef(null);
  const html5QrcodeScanner = useRef(null);
  const [scanHistory, setScanHistory] = useState([]);
  const [stats, setStats] = useState({
    totalScans: 0,
    validScans: 0,
    invalidScans: 0,
    duplicateScans: 0
  });

  const SCAN_COOLDOWN = 2000; // 2 seconds between scans

  useEffect(() => {
    // Initialize audio for feedback
    audioRef.current = new Audio();
    
    // Load scan history if in validation mode
    if (mode === 'validation' && eventId) {
      loadScanHistory();
      loadStats();
    }

    // Initialize scanner
    initializeScanner();

    // Cleanup on unmount
    return () => {
      if (html5QrcodeScanner.current) {
        html5QrcodeScanner.current.clear().catch(console.error);
      }
    };
  }, [eventId, mode]);

  const initializeScanner = () => {
    if (html5QrcodeScanner.current) {
      return; // Already initialized
    }

    const config = {
      fps: 10,
      qrbox: { width: 250, height: 250 },
      aspectRatio: 1.0,
      disableFlip: false,
    };

    html5QrcodeScanner.current = new Html5QrcodeScanner(
      "qr-scanner-container",
      config,
      false
    );

    html5QrcodeScanner.current.render(
      (decodedText) => {
        handleScan({ text: decodedText }, null);
      },
      (error) => {
        // Handle scan failure (usually just no QR code detected)
        console.log('QR scan error:', error);
      }
    );
  };

  const loadScanHistory = async () => {
    try {
      const response = await api.get(`/api/qr-validation/scan-history/${eventId}`);
      setScanHistory(response.data.data || []);
    } catch (error) {
      console.error('Error loading scan history:', error);
    }
  };

  const loadStats = async () => {
    try {
      const response = await api.get(`/api/qr-validation/validation-stats/${eventId}`);
      setStats(response.data.data || stats);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const playFeedbackSound = (isValid) => {
    if (audioRef.current) {
      // Create different tones for valid/invalid scans
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.setValueAtTime(isValid ? 800 : 300, audioContext.currentTime);
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    }
  };

  const vibrateFeedback = (pattern) => {
    if (navigator.vibrate) {
      navigator.vibrate(pattern);
    }
  };

  const handleScan = async (result, error) => {
    if (result) {
      const now = Date.now();
      
      // Prevent rapid duplicate scans
      if (now - lastScanTime < SCAN_COOLDOWN) {
        return;
      }
      
      setLastScanTime(now);
      setScanResult(result?.text || '');
      setError('');
      
      if (mode === 'validation' && eventId) {
        await validateTicket(result?.text);
      } else {
        // Just display the scanned result
        if (onScanResult) {
          onScanResult(result?.text);
        }
      }
    }
    
    if (error) {
      setError(error.message || 'Scanning error occurred');
    }
  };

  const validateTicket = async (qrData) => {
    try {
      setScanning(true);
      setValidationResult(null);
      
      const response = await api.post('/api/qr-validation/validate', {
        qrData,
        eventId,
        location: await getCurrentLocation()
      });
      
      const result = response.data.data;
      setValidationResult(result);
      
      // Provide feedback
      playFeedbackSound(result.valid);
      vibrateFeedback(result.valid ? [100] : [100, 100, 100]);
      
      // Update local stats and history
      setStats(prev => ({
        ...prev,
        totalScans: prev.totalScans + 1,
        validScans: result.valid ? prev.validScans + 1 : prev.validScans,
        invalidScans: result.valid ? prev.invalidScans : prev.invalidScans + 1,
        duplicateScans: result.isDuplicate ? prev.duplicateScans + 1 : prev.duplicateScans
      }));
      
      if (result.valid) {
        setScanHistory(prev => [result, ...prev.slice(0, 49)]); // Keep last 50 scans
      }
      
      if (onScanResult) {
        onScanResult(result);
      }
      
    } catch (error) {
      console.error('Validation error:', error);
      setError(error.response?.data?.message || 'Validation failed');
      setValidationResult({
        valid: false,
        reason: error.response?.data?.message || 'Validation failed'
      });
      
      playFeedbackSound(false);
      vibrateFeedback([100, 100, 100]);
    } finally {
      setScanning(false);
    }
  };

  const getCurrentLocation = () => {
    return new Promise((resolve) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          }),
          () => resolve(null),
          { timeout: 5000, enableHighAccuracy: false }
        );
      } else {
        resolve(null);
      }
    });
  };

  const clearResult = () => {
    setScanResult('');
    setValidationResult(null);
    setError('');
  };

  const switchCamera = () => {
    setFacingMode(prev => prev === 'environment' ? 'user' : 'environment');
  };

  const getResultColor = (result) => {
    if (!result) return '';
    if (result.valid) return 'success';
    if (result.isDuplicate) return 'warning';
    return 'error';
  };

  const getResultIcon = (result) => {
    if (!result) return '';
    if (result.valid) return '✅';
    if (result.isDuplicate) return '🔄';
    return '❌';
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  return (
    <div className="qr-scanner-container">
      <div className="scanner-header">
        <h3>📱 QR Code Scanner</h3>
        {mode === 'validation' && (
          <div className="scan-stats">
            <div className="stat-item">
              <span className="stat-number">{stats.totalScans}</span>
              <span className="stat-label">Total</span>
            </div>
            <div className="stat-item success">
              <span className="stat-number">{stats.validScans}</span>
              <span className="stat-label">Valid</span>
            </div>
            <div className="stat-item error">
              <span className="stat-number">{stats.invalidScans}</span>
              <span className="stat-label">Invalid</span>
            </div>
          </div>
        )}
      </div>

      <div className="scanner-main">
        <div className="camera-container">
          <div id="qr-scanner-container" className="qr-reader"></div>
          
          <div className="camera-overlay">
            <div className="scan-frame">
              <div className="scan-corner top-left"></div>
              <div className="scan-corner top-right"></div>
              <div className="scan-corner bottom-left"></div>
              <div className="scan-corner bottom-right"></div>
            </div>
            
            <div className="scan-instruction">
              {scanning ? 'Validating...' : 'Position QR code within the frame'}
            </div>
          </div>
          
          <button 
            onClick={switchCamera} 
            className="camera-switch"
            title="Switch Camera"
          >
            🔄
          </button>
        </div>

        {(scanResult || validationResult || error) && (
          <div className="scan-results">
            {validationResult && (
              <div className={`validation-result ${getResultColor(validationResult)}`}>
                <div className="result-header">
                  <span className="result-icon">
                    {getResultIcon(validationResult)}
                  </span>
                  <span className="result-status">
                    {validationResult.valid ? 'VALID TICKET' : 'INVALID TICKET'}
                  </span>
                  <button onClick={clearResult} className="clear-button">×</button>
                </div>
                
                <div className="result-details">
                  <div className="detail-item">
                    <strong>Reason:</strong> {validationResult.reason}
                  </div>
                  
                  {validationResult.ticket && (
                    <>
                      <div className="detail-item">
                        <strong>Ticket:</strong> {validationResult.ticket.ticketCode}
                      </div>
                      <div className="detail-item">
                        <strong>User:</strong> {validationResult.ticket.user?.username}
                      </div>
                      {validationResult.ticket.seatNumber && (
                        <div className="detail-item">
                          <strong>Seat:</strong> {validationResult.ticket.seatNumber}
                        </div>
                      )}
                    </>
                  )}
                  
                  {validationResult.isDuplicate && (
                    <div className="detail-item warning">
                      <strong>⚠️ Warning:</strong> This ticket was already scanned
                    </div>
                  )}
                  
                  <div className="detail-item">
                    <strong>Scanned:</strong> {formatTimestamp(Date.now())}
                  </div>
                </div>
              </div>
            )}
            
            {error && (
              <div className="error-result">
                <div className="result-header">
                  <span className="result-icon">⚠️</span>
                  <span className="result-status">SCAN ERROR</span>
                  <button onClick={clearResult} className="clear-button">×</button>
                </div>
                <div className="result-details">
                  <div className="detail-item">{error}</div>
                </div>
              </div>
            )}
            
            {scanResult && !validationResult && !error && (
              <div className="scan-data">
                <div className="result-header">
                  <span className="result-icon">📄</span>
                  <span className="result-status">QR CODE DATA</span>
                  <button onClick={clearResult} className="clear-button">×</button>
                </div>
                <div className="result-details">
                  <div className="detail-item">
                    <code>{scanResult}</code>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {mode === 'validation' && scanHistory.length > 0 && (
        <div className="scan-history">
          <h4>📋 Recent Valid Scans</h4>
          <div className="history-list">
            {scanHistory.slice(0, 5).map((scan, index) => (
              <div key={index} className="history-item">
                <div className="history-ticket">
                  <span className="ticket-code">{scan.ticket?.ticketCode}</span>
                  <span className="ticket-user">{scan.ticket?.user?.username}</span>
                </div>
                <div className="history-time">
                  {formatTimestamp(scan.scannedAt || Date.now())}
                </div>
              </div>
            ))}
          </div>
          
          {scanHistory.length > 5 && (
            <button 
              onClick={() => {/* Show full history modal */}} 
              className="view-all-button"
            >
              View All ({scanHistory.length} total)
            </button>
          )}
        </div>
      )}

      <div className="scanner-instructions">
        <h4>📖 Instructions:</h4>
        <ul>
          <li>Point camera at QR code</li>
          <li>Keep steady until scan completes</li>
          <li>Ensure good lighting</li>
          <li>Use switch camera button if needed</li>
          {mode === 'validation' && (
            <>
              <li>Valid tickets will show green ✅</li>
              <li>Invalid tickets will show red ❌</li>
              <li>Used tickets will show warning 🔄</li>
            </>
          )}
        </ul>
      </div>
    </div>
  );
};

export default QRScanner;