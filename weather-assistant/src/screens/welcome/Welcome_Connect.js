import React, { useState } from 'react';
import './Welcome_Connect.css';
import ledService from '../../services/LEDService';
import { Bluetooth, Check, ArrowRight } from 'lucide-react';

const WelcomeConnect = ({ onNext, onBack }) => {
  const [status, setStatus] = useState('idle'); // idle, connecting, connected, error

  const handleConnect = async () => {
    setStatus('connecting');
    
    const success = await ledService.connect();
    
    if (success) {
      setStatus('connected');
      // 연결 성공 후 잠시 보여주고 다음으로 이동 (선택사항)
      setTimeout(() => {
        onNext();
      }, 1500);
    } else {
      setStatus('error');
      // 에러 발생 시 잠시 후 다시 idle 상태로 복귀
      setTimeout(() => setStatus('idle'), 2000);
    }
  };

  return (
    <div className="app-container welcome-connect-root">
      {/* 뒤로가기 */}
      <div className="frame-header">
        <div className="arrow-back" onClick={onBack}>
          <img
            src={`${process.env.PUBLIC_URL}/assets/icons/arrow-left.svg`}
            alt="Back"
            className="arrow-back-icon"
          />
        </div>
      </div>

      {/* 아이콘 */}
      <div className={`connect-icon-wrapper ${status === 'connected' ? 'connected' : ''}`}>
        {status === 'connected' ? (
          <Check size={64} color="#10b981" />
        ) : (
          <Bluetooth className="bluetooth-icon" />
        )}
      </div>

      {/* 텍스트 */}
      <h2 className="connect-title">
        {status === 'connected' ? '연결되었습니다!' : 'Lumee와 연결할까요?'}
      </h2>
      
      <p className="connect-desc">
        {status === 'connected' 
          ? '이제 날씨에 따라 LED가 빛납니다.\n메인 화면으로 이동합니다.' 
          : '블루투스로 아두이노와 연결하여\n날씨에 반응하는 LED를 경험해보세요.'}
      </p>

      {/* 버튼 영역 */}
      {status === 'idle' || status === 'error' ? (
        <button className="connect-btn primary" onClick={handleConnect}>
          {status === 'error' ? '다시 시도하기' : '연결하기'}
        </button>
      ) : status === 'connecting' ? (
        <button className="connect-btn primary" disabled>
          <div className="spinner" /> 연결 중...
        </button>
      ) : (
        <button className="connect-btn success" onClick={onNext}>
          메인으로 이동 <ArrowRight size={20} />
        </button>
      )}

      {/* 건너뛰기 (연결 안 함) */}
      {status !== 'connected' && (
        <button className="skip-btn" onClick={onNext}>
          다음에 연결하기
        </button>
      )}
    </div>
  );
};

export default WelcomeConnect;