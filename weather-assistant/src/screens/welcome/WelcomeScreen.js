// src/screens/welcome/WelcomeScreen.js
import React, { useState, useEffect } from 'react';
import './WelcomeScreen.css';   // 카드형 첫 화면
import './WelcomeStep1.css';    // 온보딩 step1/step2
import './WelcomeStep3.css';    // 온보딩 step3 (채팅 + 말풍선 애니메이션)
import './Welcome_Persona.css'; // 페르소나 선택 화면
import WelcomeConnect from './Welcome_Connect';

const WelcomeScreen = ({ setView, setUid }) => {   // setUid prop 추가
  // step0 → 카드형
  // step1 → 온보딩 1
  // step2 → 온보딩 2
  // step3 → 온보딩 3 (채팅)
  // step4 → 페르소나 선택
  // step5 → 아두이노 연결
  const [step, setStep] = useState(0);
  const [selectedUid, setSelectedUid] = useState(null);
  
  const orbSrc = {
    mp4: "https://res.cloudinary.com/dpuw0gcaf/video/upload/v1748854350/LumeeMagicOrb_Safari_rdmthi.mov",
    webm: "https://res.cloudinary.com/dpuw0gcaf/video/upload/v1748852283/LumeeMagicOrb_WEBM_tfqoa4.webm"
  };

  const [videoError, setVideoError] = useState(false);
  const [canPlay, setCanPlay] = useState(false);

  // step3 말풍선 등장 관리
  const [bubbleStage, setBubbleStage] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setCanPlay(true), 80);
    return () => clearTimeout(t);
  }, []);

  const handleVideoError = () => setVideoError(true);

  // step3 말풍선 애니메이션 타이밍
  useEffect(() => {
    if (step !== 3) return;
    setBubbleStage(0);

    const timers = [
      setTimeout(() => setBubbleStage(1), 200),
      setTimeout(() => setBubbleStage(2), 700),
      setTimeout(() => setBubbleStage(3), 1200),
      setTimeout(() => setBubbleStage(4), 1700),
    ];

    return () => timers.forEach((t) => clearTimeout(t));
  }, [step]);

  // 🔥 페르소나 선택 시 -> 연결 화면(Step 5)으로 이동
  const handleSelectPersona = (uid) => {
    setSelectedUid(uid); // UID 임시 저장
    setStep(5);          // 연결 화면으로 이동
  };

  // 🔥 최종 완료 (홈으로 이동)
  const handleFinishWelcome = () => {
    if (typeof setUid === 'function' && selectedUid) {
      setUid(selectedUid); // 최종적으로 App.js의 UID 설정
    }
    setView('home');       // 홈 화면으로 이동
  };

  /* =========================================
      STEP 0 : 카드형 웰컴 화면
  ========================================== */
  if (step === 0) {
    return (
      <div className="welcome-screen app-container">
        <h1 className="welcome-title">Lumee</h1>
        <p className="welcome-subtitle">LLM-based weather assistant app</p>

        <div className="orb-video-container">
          <div className="orb-glow" />
          {!videoError && canPlay ? (
            <video
              className="orb-video"
              autoPlay
              loop
              muted
              playsInline
              controls={false}
              onError={handleVideoError}
            >
              <source src={orbSrc.webm} type="video/webm" />
              <source src={orbSrc.mp4} type="video/mp4; codecs='hvc1'" />
            </video>
          ) : (
            <div className="video-error-message">비디오 로드에 실패했습니다.</div>
          )}
        </div>

        <div className="welcome-text">
          <p className="welcome-message">환영합니다!</p>
          <p className="welcome-message">Lumee와 함께</p>
          <p className="welcome-message">오늘을 준비해보세요</p>
          <p className="welcome-info">Lumee는 당신의 하루에 최적화된 정보를 제공합니다</p>
        </div>

        <div className="button-container">
          <div className="start-arrow" />
          <button className="start-button" onClick={() => setStep(1)}>
            시작하기
          </button>
        </div>
      </div>
    );
  }

  /* =========================================
      STEP 1 : 온보딩 1
  ========================================== */
  if (step === 1) {
    return (
      <div className="welcome-screen app-container welcome-step1-root">
        <div className="frame-header">
          <div className="arrow-back" onClick={() => setStep(0)}>
            <img
              src={`${process.env.PUBLIC_URL}/assets/icons/arrow-left.svg`}
              alt="Back"
              className="arrow-back-icon"
            />
          </div>
        </div>

        <div className="onb-progress onb-progress-step1">
          <div className="onb-segment" />
          <div className="onb-segment" />
          <div className="onb-segment" />
        </div>

        <div className="onb-text">
          <h2>날씨와 맞춤 정보를 확인해보세요</h2>
          <p>당신의 일정과 취향, 날씨 기반으로<br />가장 적합한 외출 가이드를 제공합니다.</p>
        </div>

        <div className="onb-orb-container">
          <div className="onb-orb-glow" />
          <video
            className="onb-orb-video"
            autoPlay
            loop
            muted
            playsInline
            controls={false}
            onError={handleVideoError}
          >
            <source src={orbSrc.webm} type="video/webm" />
            <source src={orbSrc.mp4} type="video/mp4; codecs='hvc1'" />
          </video>
        </div>

        <button className="onb-next" onClick={() => setStep(2)}>
          다음으로
        </button>
      </div>
    );
  }

  /* =========================================
      STEP 2 : 온보딩 2
  ========================================== */
  if (step === 2) {
    return (
      <div className="welcome-screen app-container welcome-step2-root">
        <div className="frame-header">
          <div className="arrow-back" onClick={() => setStep(1)}>
            <img
              src={`${process.env.PUBLIC_URL}/assets/icons/arrow-left.svg`}
              alt="Back"
              className="arrow-back-icon"
            />
          </div>
        </div>

        <div className="onb-progress onb-progress-step2">
          <div className="onb-segment" />
          <div className="onb-segment" />
          <div className="onb-segment" />
        </div>

        <div className="onb-text">
          <h2>개인화된 코디 피드백을 받아보세요</h2>
          <p>오늘의 기온과 활동에 맞춰<br />최적화된 옷차림을 추천해드립니다.</p>
        </div>

        <div className="onb-orb-container">
          <div className="onb-orb-glow" />
          <video
            className="onb-orb-video"
            autoPlay
            loop
            muted
            playsInline
            onError={handleVideoError}
          >
            <source src={orbSrc.webm} type="video/webm" />
            <source src={orbSrc.mp4} type="video/mp4; codecs='hvc1'" />
          </video>
        </div>

        <button className="onb-next" onClick={() => setStep(3)}>
          다음으로
        </button>
      </div>
    );
  }

  /* =========================================
    STEP 3 : 온보딩 3 (채팅 + 말풍선 애니메이션)
  ========================================== */
  if (step === 3) {
    return (
      <div className="welcome-screen app-container welcome-step3-root">
        {/* 뒤로가기 */}
        <div className="frame-header">
          <div className="arrow-back" onClick={() => setStep(2)}>
            <img
              src={`${process.env.PUBLIC_URL}/assets/icons/arrow-left.svg`}
              alt="Back"
              className="arrow-back-icon"
            />
          </div>
        </div>

        {/* 진행바 */}
        <div className="onb-progress onb-progress-step3">
          <div className="onb-segment" />
          <div className="onb-segment" />
          <div className="onb-segment" />
        </div>

        {/* 흐린 구슬 배경 */}
        <div className="step3-orb-container">
          <video
            className="step3-orb-video"
            autoPlay
            loop
            muted
            playsInline
          >
            <source src={orbSrc.webm} type="video/webm" />
            <source src={orbSrc.mp4} type="video/mp4; codecs='hvc1'" />
          </video>
        </div>

        {/* 텍스트 */}
        <div className="step3-text">
          <h2>루미와 자연스럽게 소통해보세요</h2>
          <p>
            음성이나 채팅을 통해 질문하고<br />
            맞춤 정보를 빠르게 확인하세요.
          </p>
        </div>

        {/* 말풍선 */}
        <div className="step3-chat-wrapper">
          <div
            className={
              `step3-bubble step3-b1 ${bubbleStage >= 1 ? 'step3-bubble-show' : ''}`
            }
          />
          <div
            className={
              `step3-bubble step3-b2 ${bubbleStage >= 2 ? 'step3-bubble-show' : ''}`
            }
          />
          <div
            className={
              `step3-bubble step3-b3 ${bubbleStage >= 3 ? 'step3-bubble-show' : ''}`
            }
          />
          <div
            className={
              `step3-bubble step3-b4 ${bubbleStage >= 4 ? 'step3-bubble-show' : ''}`
            }
          />
        </div>

        {/* 🔥 여기서 홈이 아니라 step4(페르소나 선택)로 이동 */}
        <button className="step3-start-btn" onClick={() => setStep(4)}>
          시작하기
        </button>
      </div>
    );
  }

  /* =========================================
    STEP 4 : 페르소나 선택 화면
  ========================================== */
  if (step === 4) {
    return (
      <div className="welcome-screen app-container welcome-persona-root">
        <div className="frame-header">
          <div className="arrow-back" onClick={() => setStep(3)}>
            <img src={`${process.env.PUBLIC_URL}/assets/icons/arrow-left.svg`} alt="Back" className="arrow-back-icon" />
          </div>
        </div>
        <div className="persona-title-block">
          <h2 className="persona-title-main">Who are you today?</h2>
          <p className="persona-title-sub">Choose your Lumee Persona to begin</p>
        </div>
        <div className="persona-card-row">
          <button className="persona-card" onClick={() => handleSelectPersona('testUser1')}>
            <div className="persona-avatar">
              <img src={`${process.env.PUBLIC_URL}/assets/icons/minseo.png`} alt="Minseo" />
            </div>
            <div className="persona-name">Minseo</div>
            <div className="persona-desc">날씨·알레르기에{'\n'}예민한 도시형 플래너</div>
          </button>
          <button className="persona-card" onClick={() => handleSelectPersona('testUser2')}>
            <div className="persona-avatar">
              <img src={`${process.env.PUBLIC_URL}/assets/icons/minjun.png`} alt="Minjun" />
            </div>
            <div className="persona-name">Minjun</div>
            <div className="persona-desc">주말마다 자연을{'\n'}향하는 아웃도어 탐험가</div>
          </button>
        </div>
      </div>
    );
  }

  /* =========================================
    🔥 STEP 5 : 아두이노 연결 화면 (NEW)
  ========================================== */
  return (
    <WelcomeConnect 
      onNext={handleFinishWelcome} 
      onBack={() => setStep(4)} 
    />
  );
};

export default WelcomeScreen;
