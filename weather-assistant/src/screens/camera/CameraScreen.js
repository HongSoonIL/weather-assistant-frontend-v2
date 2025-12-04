import React, { useState, useRef } from 'react';
import './Camera_Before.css';
import './Camera_Cautions.css';
import './Camera.css';
import './Camera_Done.css';

const CameraScreen = ({ onBack, uid }) => {
  // 환경 변수에서 URL 가져오기
  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:4000';
  const RASPI_URL = process.env.REACT_APP_RASPI_URL || 'http://192.168.50.135:5000';
  
  // 상태 관리
  const [step, setStep] = useState('cautions'); // cautions -> before -> scanning -> done
  const [capturedImage, setCapturedImage] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const streamImgRef = useRef(null);

  // 사용자 프로필
  const userProfiles = {
    testUser1: { name: '김민서' },
    testUser2: { name: '이민준' }
  };
  const currentUser = userProfiles[uid] || userProfiles['testUser1'];
  const userName = currentUser.name;

  // 촬영 처리 함수
  const handleCapture = async () => {
    setLoading(true);
    setStep('scanning');
    setError(null);

    try {
      console.log('📸 촬영 요청 시작...');
      
      // 백엔드를 통해 촬영 요청
      const response = await fetch(`${BACKEND_URL}/camera/capture`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ uid })
      });

      if (!response.ok) {
        throw new Error(`촬영 실패: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ 촬영 응답:', data);

      if (data.success && data.image) {
        // Base64 이미지 저장
        setCapturedImage(`data:image/jpeg;base64,${data.image}`);
        setAnalysisResult(data.analysis);
        
        // 3초 후 완료 화면으로
        setTimeout(() => {
          setStep('done');
          setLoading(false);
        }, 3000);
      } else {
        throw new Error(data.error || '촬영 실패');
      }

    } catch (err) {
      console.error('❌ 촬영 오류:', err);
      setError(err.message);
      setStep('before');
      setLoading(false);
      
      // 3초 후 에러 메시지 자동 제거
      setTimeout(() => setError(null), 3000);
    }
  };

  // 재촬영
  const handleRetake = () => {
    setCapturedImage(null);
    setAnalysisResult(null);
    setError(null);
    setStep('before');
  };

  // 에러 표시 컴포넌트
  const ErrorToast = () => error ? (
    <div style={{
      position: 'fixed',
      bottom: '100px',
      left: '50%',
      transform: 'translateX(-50%)',
      background: 'rgba(244, 67, 54, 0.95)',
      color: 'white',
      padding: '12px 24px',
      borderRadius: '20px',
      fontSize: '14px',
      fontWeight: '500',
      zIndex: 9999,
      boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
      animation: 'slideUp 0.3s ease-out'
    }}>
      ⚠️ {error}
    </div>
  ) : null;

  // 1. 주의사항 화면
  const renderCautions = () => (
    <div className="app-container camera-cautions">
      <div className="camera-status-bar">
        <div className="camera-time-center"></div>
      </div>

      <div className="camera-header">
        <div className="camera-header-back" onClick={onBack}>
          <img
            src={`${process.env.PUBLIC_URL}/assets/icons/arrow-left.svg`}
            alt="Back"
          />
        </div>
      </div>

      <div className="camera-sheet">
        <button className="camera-sheet-close" type="button" onClick={onBack}>
          ✕
        </button>

        <div className="camera-sheet-title">
          <span className="camera-sheet-title-highlight">스캔 전</span>
          <span>에</span>
          <br />
          <span>이건 꼭 알아두세요!</span>
        </div>

        <div className="camera-sheet-description">
          정확하고 디테일한 복장 및 피부 스캔을 위해,
          <br />
          아래 지정된 선 안에서 카메라를 정면으로 바라봐 주세요.
        </div>

        <div className="camera-tip-card">
          알레르기나 발진 부위가 있다면 해당
          <br />
          부위가 잘 보이도록 촬영해 주세요.
        </div>

        <div className="camera-tip-card">
          오늘 챙긴 마스크, 모자 등 소지품이
          <br />
          스캔에 포함될 수 있도록 해주세요.
        </div>

        <div className="camera-tip-card">
          정면에서 피부 톤과 컨디션이
          <br />
          잘 보이도록 스캔해 주세요.
        </div>

        <button
          className="camera-sheet-confirm"
          type="button"
          onClick={() => setStep('before')}
          disabled={loading}
        >
          {loading ? '연결 중...' : '확인'}
        </button>
      </div>

      <div className="camera-home-indicator-container">
        <div className="camera-home-indicator" />
      </div>
    </div>
  );

  // 2. 실시간 카메라 화면
  const renderBefore = () => (
  <div className="app-container camera-before">
    <div className="status-bar">
      <div className="time-text"></div>
    </div>

    {/* 🔥 실시간 스트림 - 전체 화면으로 표시 */}
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: '#000',
      overflow: 'hidden',
      zIndex: 1
    }}>
      <img
        ref={streamImgRef}
        src={`${RASPI_URL}/video_feed?t=${Date.now()}`}
        alt="Camera Stream"
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%) scaleX(-1)', // 중앙 정렬 + 거울 모드
          minWidth: '100%',
          minHeight: '100%',
          width: 'auto',
          height: 'auto',
          maxWidth: 'none',
          objectFit: 'cover'
        }}
        onError={(e) => {
          console.error('스트림 로드 실패');
          e.target.style.display = 'none';
          setError('카메라 연결 확인 필요');
        }}
        onLoad={() => {
          console.log('✅ 스트림 연결됨');
          if (error === '카메라 연결 확인 필요') {
            setError(null);
          }
        }}
      />
    </div>

    {/* 오버레이 (가이드 라인 등) */}
    <div className="overlay-rectangle" style={{ zIndex: 2 }}></div>

    {/* 뒤로가기 버튼 */}
    <div className="frame-header" style={{ zIndex: 10 }}>
      <div className="arrow-back" onClick={() => setStep('cautions')}>
        <img
          src={`${process.env.PUBLIC_URL}/assets/icons/arrow-left.svg`}
          alt="Back"
          style={{ filter: 'invert(1)' }}
        />
      </div>
    </div>

    {/* 촬영 가이드 텍스트 */}
    <div style={{
      position: 'absolute',
      bottom: '150px',
      left: '50%',
      transform: 'translateX(-50%)',
      color: 'white',
      fontSize: '16px',
      fontWeight: '500',
      textAlign: 'center',
      textShadow: '0 2px 8px rgba(0,0,0,0.8)',
      zIndex: 10,
      pointerEvents: 'none',
      padding: '8px 20px',
      backgroundColor: 'rgba(0,0,0,0.3)',
      borderRadius: '20px'
    }}>
      원하는 구도에서<br />촬영 버튼을 눌러주세요
    </div>

    {/* 촬영 버튼 */}
    <div 
      className="camera-button" 
      onClick={handleCapture}
      style={{ 
        cursor: loading ? 'not-allowed' : 'pointer',
        zIndex: 10
      }}
    >
      <img
        src={`${process.env.PUBLIC_URL}/assets/icons/camerabutton.svg`}
        alt="Camera Button"
        className="camera-button-icon"
        style={{ opacity: loading ? 0.5 : 1 }}
      />
    </div>

    <ErrorToast />

    <div className="home-indicator-wrapper" style={{ zIndex: 10 }}>
      <div className="home-indicator-bar"></div>
    </div>
  </div>
);

  // 3. 스캔 중 화면
  const renderScanning = () => (
    <div className="app-container camera">
      <div className="background-image" style={{
        backgroundImage: 'none',
        backgroundColor: '#000'
      }}>
        <img
          src={`${RASPI_URL}/video_feed`}
          alt="Scanning"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transform: 'scaleX(-1)',
            filter: 'blur(5px)'
          }}
        />
      </div>
      <div className="overlay-rectangle" style={{ opacity: 0.7 }}></div>

      <div className="status-bar">
        <div className="time"></div>
      </div>

      <div className="top-nav">
        <div className="back-arrow" onClick={() => setStep('before')}>
          <img
            src={`${process.env.PUBLIC_URL}/assets/icons/arrow-left.svg`}
            alt="Back"
            style={{ filter: 'invert(1)' }}
          />
        </div>
      </div>

      <div className="scan-message">
        <span className="scan-username">{userName}</span>
        <span> 님의 착장을</span>
        <br />
        <span>스캔하고 있어요...</span>
      </div>

      {/* 로딩 스피너 */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 10
      }}>
        <div style={{
          width: '60px',
          height: '60px',
          border: '4px solid rgba(255,255,255,0.2)',
          borderTopColor: 'white',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
      </div>

      <div className="camera-button camera-button-disabled" style={{ opacity: 0.5 }}>
        <img
          src={`${process.env.PUBLIC_URL}/assets/icons/camerabutton.svg`}
          alt="Camera Button"
          className="camera-button-icon"
        />
      </div>

      <div className="home-indicator">
        <div className="home-bar"></div>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );

  // 4. 완료 화면
  const renderDone = () => (
    <div className="app-container camera-done">
      {/* 촬영된 이미지를 배경으로 */}
      <div 
        className="background-image" 
        style={{ 
          backgroundImage: capturedImage ? `url(${capturedImage})` : 'none',
          filter: 'blur(25px)',
          backgroundColor: '#000'
        }}
      />
      <div className="gradient-overlay"></div>

      <div className="status-bar">
        <div className="time"></div>
      </div>

      <div className="header-frame">
        <div className="back-arrow" onClick={handleRetake}>
          <img
            src={`${process.env.PUBLIC_URL}/assets/icons/arrow-left.svg`}
            alt="Back"
          />
        </div>
      </div>

      <div className="scan-complete">
        <span className="scan-complete-username">{userName}</span>
        <span> 님의 착장</span>
        <br />
        <span>스캔을 완료했어요</span>
      </div>

      {/* 촬영된 사진 프리뷰 */}
      <div className="photo-preview" style={{
        backgroundImage: capturedImage ? `url(${capturedImage})` : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        position: 'relative'
      }}>
        {/* 분석 결과 오버레이 */}
        {analysisResult && (
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            padding: '15px',
            background: 'rgba(0,0,0,0.7)',
            color: 'white',
            borderBottomLeftRadius: '28px',
            borderBottomRightRadius: '28px',
            fontSize: '14px',
            textAlign: 'center'
          }}>
            <div style={{ marginBottom: '8px', fontSize: '16px', fontWeight: 'bold' }}>
              {analysisResult.style || '스타일 분석 완료'}
            </div>
            <div style={{ fontSize: '13px', opacity: 0.9 }}>
              {analysisResult.weather_recommendation || '오늘 날씨에 딱 맞는 옷차림이에요!'}
            </div>
          </div>
        )}
      </div>

      {/* 완료 버튼 */}
      <div className="camera-check" onClick={onBack}>
        <div className="circle"></div>
        <div className="inner-circle"></div>
        <div className="center-dot"></div>
      </div>

      <div className="home-indicator-wrapper">
        <div className="home-indicator"></div>
      </div>
    </div>
  );

  // 렌더링
  switch (step) {
    case 'cautions':
      return renderCautions();
    case 'before':
      return renderBefore();
    case 'scanning':
      return renderScanning();
    case 'done':
      return renderDone();
    default:
      return renderCautions();
  }
};

export default CameraScreen;