/**
 * WeatherScreen.js
 * LED 서비스를 백그라운드에서 자동 실행하도록 통합
 */

import React, { useState, useEffect } from 'react';
import ledService from '../services/LEDService';

function WeatherScreen() {
  const [weatherData, setWeatherData] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [ledConnectionStatus, setLedConnectionStatus] = useState('대기 중');

  // 컴포넌트 마운트 시 LED 서비스 초기화
  useEffect(() => {
    initializeLEDService();

    // 컴포넌트 언마운트 시 서비스 종료
    return () => {
      ledService.destroy();
    };
  }, []);

  // 날씨 데이터 변경 시 LED 업데이트
  useEffect(() => {
    if (weatherData) {
      updateLEDWithWeather();
    }
  }, [weatherData, userProfile]);

  /**
   * LED 서비스 초기화
   */
  const initializeLEDService = async () => {
    console.log('🔮 LED 서비스 시작...');
    
    const initialized = await ledService.initialize();
    
    if (initialized) {
      setLedConnectionStatus('초기화 완료 - 화면을 클릭하세요');
      
      // 5초마다 연결 상태 체크
      const statusInterval = setInterval(() => {
        const status = ledService.getConnectionStatus();
        
        if (status.isConnected) {
          setLedConnectionStatus(`✅ 연결됨: ${status.deviceName}`);
        } else if (status.reconnectAttempts > 0) {
          setLedConnectionStatus(`🔄 재연결 시도 중... (${status.reconnectAttempts})`);
        } else {
          setLedConnectionStatus('⚠️ 연결 안 됨');
        }
      }, 5000);

      // 클린업
      return () => clearInterval(statusInterval);
    } else {
      setLedConnectionStatus('❌ 초기화 실패 - Chrome 사용 필요');
    }
  };

  /**
   * 날씨 데이터로 LED 업데이트
   */
  const updateLEDWithWeather = async () => {
    const success = await ledService.updateLED(weatherData, userProfile);
    
    if (success) {
      console.log('✅ LED 업데이트 성공');
    } else {
      console.warn('⚠️ LED 업데이트 실패 - 블루투스 연결 확인 필요');
    }
  };

  /**
   * 날씨 데이터 가져오기 (기존 함수)
   */
  const fetchWeatherData = async (location) => {
    try {
      // 기존 날씨 데이터 조회 로직...
      const response = await fetch(`${API_URL}/api/weather`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ location })
      });

      const data = await response.json();
      setWeatherData(data);

    } catch (error) {
      console.error('날씨 데이터 조회 실패:', error);
    }
  };

  /**
   * 사용자 프로필 가져오기 (기존 함수)
   */
  const fetchUserProfile = async (userId) => {
    try {
      // 기존 사용자 프로필 조회 로직...
      const profile = await getUserProfile(userId);
      setUserProfile(profile);

    } catch (error) {
      console.error('프로필 조회 실패:', error);
    }
  };

  return (
    <div className="weather-screen">
      {/* 기존 날씨 UI */}
      <div className="weather-content">
        <h1>Lumee 날씨 어시스턴트</h1>
        
        {weatherData && (
          <div className="weather-info">
            {/* 날씨 정보 표시 */}
          </div>
        )}
      </div>

      {/* LED 연결 상태 표시 (작은 아이콘으로) */}
      <div className="led-status-badge">
        <span title="LED 연결 상태">{ledConnectionStatus}</span>
      </div>

      <style jsx>{`
        .weather-screen {
          position: relative;
          width: 100%;
          min-height: 100vh;
        }

        .led-status-badge {
          position: fixed;
          bottom: 20px;
          right: 20px;
          background: rgba(0, 0, 0, 0.7);
          color: white;
          padding: 8px 15px;
          border-radius: 20px;
          font-size: 12px;
          backdrop-filter: blur(10px);
          z-index: 1000;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .led-status-badge:hover {
          background: rgba(0, 0, 0, 0.9);
          transform: scale(1.05);
        }

        /* 전시용: LED 상태를 완전히 숨기려면 이 코드 사용 */
        .led-status-badge.hidden {
          display: none;
        }
      `}</style>
    </div>
  );
}

export default WeatherScreen;