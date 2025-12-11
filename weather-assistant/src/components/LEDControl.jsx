/**
 * LEDControl.jsx
 * Lumee 웹에서 아두이노 LED 제어
 */

import React, { useState, useEffect } from 'react';
import axios from 'axios';

const LEDControl = ({ weatherData, userProfile }) => {
  const [ledStatus, setLedStatus] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [bluetoothDevice, setBluetoothDevice] = useState(null);
  const [characteristic, setCharacteristic] = useState(null);
  const [error, setError] = useState(null);

  // 백엔드 API URL
  const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';

  // 날씨 데이터 변경 시 LED 상태 업데이트
  useEffect(() => {
    if (weatherData) {
      fetchLEDStatus();
    }
  }, [weatherData]);

  // LED 상태 가져오기
  const fetchLEDStatus = async () => {
    try {
      const response = await axios.post(`${API_URL}/api/led/status`, {
        weatherData,
        userProfile
      });

      if (response.data.success) {
        setLedStatus(response.data.ledStatus);
        
        // 블루투스 연결되어 있으면 자동 전송
        if (isConnected && characteristic) {
          await sendToArduino(response.data.ledStatus);
        }
      }
    } catch (err) {
      console.error('LED 상태 조회 실패:', err);
      setError('LED 상태를 가져올 수 없습니다.');
    }
  };

  // Web Bluetooth API로 HM-10 연결
  const connectBluetooth = async () => {
    try {
      setError(null);

      // Bluetooth 장치 검색
      const device = await navigator.bluetooth.requestDevice({
        filters: [
          { namePrefix: 'HM' }, // HM-10 모듈
          { namePrefix: 'Lumee' }
        ],
        optionalServices: ['0000ffe0-0000-1000-8000-00805f9b34fb'] // HM-10 서비스 UUID
      });

      console.log('블루투스 장치 발견:', device.name);

      // GATT 서버 연결
      const server = await device.gatt.connect();
      console.log('GATT 서버 연결됨');

      // 서비스 가져오기
      const service = await server.getPrimaryService('0000ffe0-0000-1000-8000-00805f9b34fb');
      
      // 특성(Characteristic) 가져오기
      const char = await service.getCharacteristic('0000ffe1-0000-1000-8000-00805f9b34fb');

      setBluetoothDevice(device);
      setCharacteristic(char);
      setIsConnected(true);

      // 현재 LED 상태 전송
      if (ledStatus) {
        await sendToArduino(ledStatus);
      }

      console.log('블루투스 연결 완료');

    } catch (err) {
      console.error('블루투스 연결 실패:', err);
      setError(`블루투스 연결 실패: ${err.message}`);
      setIsConnected(false);
    }
  };

  // 블루투스 연결 해제
  const disconnectBluetooth = () => {
    if (bluetoothDevice && bluetoothDevice.gatt.connected) {
      bluetoothDevice.gatt.disconnect();
    }
    setBluetoothDevice(null);
    setCharacteristic(null);
    setIsConnected(false);
  };

  // 아두이노로 데이터 전송
  const sendToArduino = async (status) => {
    if (!characteristic) {
      console.error('블루투스가 연결되지 않았습니다.');
      return;
    }

    try {
      // JSON 데이터 생성
      const data = {
        r: status.color.r,
        g: status.color.g,
        b: status.color.b,
        effect: status.effect,
        duration: status.duration,
        priority: status.priority
      };

      const jsonString = JSON.stringify(data) + '\n';
      const encoder = new TextEncoder();
      const dataArray = encoder.encode(jsonString);

      // 20바이트씩 나누어 전송 (BLE 패킷 크기 제한)
      for (let i = 0; i < dataArray.length; i += 20) {
        const chunk = dataArray.slice(i, i + 20);
        await characteristic.writeValue(chunk);
        await new Promise(resolve => setTimeout(resolve, 50)); // 50ms 대기
      }

      console.log('아두이노로 데이터 전송:', jsonString);

    } catch (err) {
      console.error('데이터 전송 실패:', err);
      setError(`데이터 전송 실패: ${err.message}`);
    }
  };

  // LED 상태 표시용 미리보기 색상
  const getPreviewColor = () => {
    if (!ledStatus) return 'rgb(100, 149, 237)';
    return `rgb(${ledStatus.color.r}, ${ledStatus.color.g}, ${ledStatus.color.b})`;
  };

  return (
    <div className="led-control-container">
      {/* LED 미리보기 */}
      <div className="led-preview">
        <div 
          className="led-circle"
          style={{
            backgroundColor: getPreviewColor(),
            boxShadow: `0 0 30px ${getPreviewColor()}`
          }}
        >
          <div className="led-pulse"></div>
        </div>
      </div>

      {/* LED 상태 정보 */}
      {ledStatus && (
        <div className="led-status-info">
          <h3>현재 LED 상태</h3>
          <p className="status-message">{ledStatus.message}</p>
          <div className="status-details">
            <span className="priority-badge">우선순위: {ledStatus.priority}</span>
            <span className="effect-badge">효과: {ledStatus.effect}</span>
          </div>
        </div>
      )}

      {/* 블루투스 연결 컨트롤 */}
      <div className="bluetooth-controls">
        {!isConnected ? (
          <button 
            className="btn-connect"
            onClick={connectBluetooth}
          >
            🔵 아두이노 연결
          </button>
        ) : (
          <div className="connected-controls">
            <button 
              className="btn-disconnect"
              onClick={disconnectBluetooth}
            >
              🔴 연결 해제
            </button>
            <button 
              className="btn-refresh"
              onClick={() => sendToArduino(ledStatus)}
            >
              🔄 LED 업데이트
            </button>
          </div>
        )}
      </div>

      {/* 연결 상태 표시 */}
      <div className="connection-status">
        <div className={`status-indicator ${isConnected ? 'connected' : 'disconnected'}`}>
          {isConnected ? '● 연결됨' : '○ 연결 안 됨'}
        </div>
      </div>

      {/* 에러 메시지 */}
      {error && (
        <div className="error-message">
          ⚠️ {error}
        </div>
      )}

      {/* 안내 메시지 */}
      {!isConnected && (
        <div className="info-message">
          💡 아두이노의 블루투스를 켜고 '아두이노 연결' 버튼을 눌러주세요.
        </div>
      )}

      <style jsx>{`
        .led-control-container {
          padding: 20px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 20px;
          color: white;
          max-width: 400px;
          margin: 20px auto;
        }

        .led-preview {
          display: flex;
          justify-content: center;
          margin-bottom: 20px;
        }

        .led-circle {
          width: 120px;
          height: 120px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
          position: relative;
        }

        .led-pulse {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          background: inherit;
          animation: pulse 2s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 0.8; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.05); }
        }

        .led-status-info {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          padding: 15px;
          border-radius: 15px;
          margin-bottom: 15px;
        }

        .led-status-info h3 {
          margin: 0 0 10px 0;
          font-size: 16px;
        }

        .status-message {
          font-size: 18px;
          font-weight: bold;
          margin: 10px 0;
        }

        .status-details {
          display: flex;
          gap: 10px;
          margin-top: 10px;
        }

        .priority-badge, .effect-badge {
          background: rgba(255, 255, 255, 0.2);
          padding: 5px 10px;
          border-radius: 20px;
          font-size: 12px;
        }

        .bluetooth-controls {
          margin-bottom: 15px;
        }

        .btn-connect, .btn-disconnect, .btn-refresh {
          width: 100%;
          padding: 12px;
          border: none;
          border-radius: 10px;
          font-size: 16px;
          font-weight: bold;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .btn-connect {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }

        .btn-connect:hover {
          transform: translateY(-2px);
          box-shadow: 0 5px 20px rgba(0, 0, 0, 0.3);
        }

        .connected-controls {
          display: flex;
          gap: 10px;
        }

        .btn-disconnect, .btn-refresh {
          flex: 1;
          background: rgba(255, 255, 255, 0.2);
          color: white;
        }

        .btn-disconnect:hover, .btn-refresh:hover {
          background: rgba(255, 255, 255, 0.3);
        }

        .connection-status {
          text-align: center;
          margin-bottom: 10px;
        }

        .status-indicator {
          display: inline-block;
          padding: 5px 15px;
          border-radius: 20px;
          font-size: 14px;
          font-weight: bold;
        }

        .status-indicator.connected {
          background: rgba(76, 175, 80, 0.3);
        }

        .status-indicator.disconnected {
          background: rgba(244, 67, 54, 0.3);
        }

        .error-message {
          background: rgba(244, 67, 54, 0.2);
          padding: 10px;
          border-radius: 10px;
          margin-top: 10px;
          font-size: 14px;
        }

        .info-message {
          background: rgba(255, 255, 255, 0.1);
          padding: 10px;
          border-radius: 10px;
          margin-top: 10px;
          font-size: 14px;
          text-align: center;
        }
      `}</style>
    </div>
  );
};

export default LEDControl;