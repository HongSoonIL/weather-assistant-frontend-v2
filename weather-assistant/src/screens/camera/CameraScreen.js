import React, { useState, useEffect } from 'react';
import './Camera_Before.css';
import './Camera_Cautions.css';
import './Camera.css';
import './Camera_Done.css';

const CameraScreen = ({ onBack, uid }) => {
  // 🔥 임시 유저 프로필 (나중에 Firebase로 교체 가능)
  const userProfiles = {
    testUser1: { name: '김민서' },
    testUser2: { name: '이민준' }
  };

  const currentUser = userProfiles[uid] || userProfiles['testUser1'];
  const userName = currentUser.name;

  // 단계 순서: 'cautions' -> 'before' -> 'scanning' -> 'done'
  const [step, setStep] = useState('cautions');

  useEffect(() => {
    let timer;
    if (step === 'scanning') {
      timer = setTimeout(() => {
        setStep('done');
      }, 3000); // 3초 후 완료
    }
    return () => clearTimeout(timer);
  }, [step]);

  // 1. Cautions 화면
  const renderCautions = () => (
    <div className="app-container camera-cautions">
      {/* 상단 상태바 */}
      <div className="camera-status-bar">
        <div className="camera-time-center"></div>
      </div>

      {/* 상단 헤더 (뒤로가기) */}
      <div className="camera-header">
        <div className="camera-header-back" onClick={onBack}>
          <img
            src={`${process.env.PUBLIC_URL}/assets/icons/arrow-left.svg`}
            alt="Back"
          />
        </div>
      </div>

      {/* 하단 시트(카드) 영역 */}
      <div className="camera-sheet">
        <button
          className="camera-sheet-close"
          type="button"
          onClick={onBack}
        >
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
        >
          확인
        </button>
      </div>

      <div className="camera-home-indicator-container">
        <div className="camera-home-indicator" />
      </div>
    </div>
  );

  // 2. Camera Before 화면
  const renderBefore = () => (
    <div className="app-container camera-before">
      <div className="status-bar">
        <div className="time-text"></div>
      </div>
      <div className="background-image"></div>
      <div className="overlay-rectangle"></div>

      <div className="frame-header">
        <div className="arrow-back" onClick={() => setStep('cautions')}>
          <img
            src={`${process.env.PUBLIC_URL}/assets/icons/arrow-left.svg`}
            alt="Back"
            style={{ filter: 'invert(1)' }}
          />
        </div>
      </div>

      <div className="camera-button" onClick={() => setStep('scanning')}>
        <img
          src={`${process.env.PUBLIC_URL}/assets/icons/camerabutton.svg`}
          alt="Camera Button"
          className="camera-button-icon"
        />
      </div>

      <div className="home-indicator-wrapper">
        <div className="home-indicator-bar"></div>
      </div>
    </div>
  );

  // 3. Camera Scanning 화면
  const renderScanning = () => (
    <div className="app-container camera">
      <div className="background-image"></div>
      <div className="overlay-rectangle"></div>

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

      <div className="camera-button camera-button-disabled">
        <img
          src={`${process.env.PUBLIC_URL}/assets/icons/camerabutton.svg`}
          alt="Camera Button"
          className="camera-button-icon"
        />
      </div>

      <div className="home-indicator">
        <div className="home-bar"></div>
      </div>
    </div>
  );

  // 4. Camera Done 화면 (스캔 완료)
  const renderDone = () => (
    <div className="app-container camera-done">
      <div className="background-image"></div>
      <div className="gradient-overlay"></div>

      {/* 상단 상태바 */}
      <div className="status-bar">
        <div className="time"></div>
      </div>

      {/* 상단 뒤로가기 */}
      <div className="header-frame">
        <div className="back-arrow" onClick={() => setStep('scanning')}>
          <img
            src={`${process.env.PUBLIC_URL}/assets/icons/arrow-left.svg`}
            alt="Back"
          />
        </div>
      </div>

      {/* 🔥 2번째 이미지처럼: 이름 + 문구 */}
      <div className="scan-complete">
        <span className="scan-complete-username">{userName}</span>
        <span> 님의 착장</span>
        <br />
        <span>스캔을 완료했어요</span>
      </div>

      {/* 🔥 큰 사진 프리뷰 */}
      <div className="photo-preview"></div>

      {/* 완료 버튼 – 일단 원래 동그라미 버튼 그대로, 나중에 check.svg 넣어도 됨 */}
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
