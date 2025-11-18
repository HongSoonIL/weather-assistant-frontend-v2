import React, { useState, useEffect } from 'react';
import './Camera_Before.css';
import './Camera_Cautions.css';
import './Camera.css';
import './Camera_Done.css';

const CameraScreen = ({ onBack }) => {
  // 1. 시작 단계를 'cautions'로 변경합니다.
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

  // 1. Cautions 화면 (이제 첫 번째 화면입니다)
  const renderCautions = () => (
    <div className="app-container camera-cautions">
      <div className="camera-status-bar">
         <div className="camera-time-center">9:41</div>
      </div>
      
      <div className="camera-frame-header">
          {/* 첫 화면이므로 뒤로가기 시 Home으로 이동(onBack) */}
          <div className="camera-back-arrow" onClick={onBack}>
              <img src={`${process.env.PUBLIC_URL}/assets/icons/arrow-left.svg`} alt="Back" style={{filter: "invert(1)"}} />
          </div>
      </div>

      <div className="camera-frame-content">
          <div className="camera-title">Cautions</div>
          <div className="camera-description">
              Please read the following guidelines carefully before proceeding.
          </div>
          
          <div className="camera-tip-box" style={{marginTop: '40px'}}>
              <div className="camera-tip-box-text">Ensure good lighting for a clear view.</div>
          </div>
           <div className="camera-tip-box">
              <div className="camera-tip-box-text">Make sure the camera lens is clean.</div>
          </div>

          {/* 버튼 클릭 시 'before' 단계로 이동 */}
          <div className="camera-check-button" onClick={() => setStep('before')}>
              <div className="camera-check-button-text">Got it, Start!</div>
          </div>
      </div>
      
      <div className="camera-home-indicator-container">
           <div className="camera-home-indicator"></div>
      </div>
    </div>
  );

  // 2. Camera Before 화면 (두 번째 화면)
  const renderBefore = () => (
    <div className="app-container camera-before">
      <div className="status-bar">
        <div className="time-text">9:41</div>
      </div>
      <div className="background-image"></div>
      <div className="overlay-rectangle"></div>
      
      <div className="frame-header">
         {/* 뒤로가기 시 'cautions'로 이동 */}
         <div className="arrow-back" onClick={() => setStep('cautions')}>
           <img src={`${process.env.PUBLIC_URL}/assets/icons/arrow-left.svg`} alt="Back" style={{filter: "invert(1)"}} />
         </div>
      </div>

      {/* 버튼 클릭 시 'scanning'으로 이동 */}
      <div className="camera-button" onClick={() => setStep('scanning')}>
        <div className="camera-button-group">
          <div className="camera-button-outer"></div>
          <div className="camera-button-inner"></div>
        </div>
      </div>

      <div className="home-indicator-wrapper">
          <div className="home-indicator-bar"></div>
      </div>
    </div>
  );

  // 3. Camera Scanning 화면 (세 번째 화면)
  const renderScanning = () => (
    <div className="app-container camera">
      <div className="background-image"></div>
      <div className="overlay-rectangle"></div>
      <div className="status-bar">
         <div className="time">9:41</div>
      </div>
      
      <div className="top-nav">
         {/* 뒤로가기 시 'before'로 이동 */}
         <div className="back-arrow" onClick={() => setStep('before')}>
           <img src={`${process.env.PUBLIC_URL}/assets/icons/arrow-left.svg`} alt="Back" style={{filter: "invert(1)"}} />
         </div>
      </div>

      <div className="scan-message">Scanning...</div>
      
      <div className="home-indicator">
          <div className="home-bar"></div>
      </div>
    </div>
  );

  // 4. Camera Done 화면 (마지막 화면)
  const renderDone = () => (
    <div className="app-container camera-done">
      <div className="background-image"></div>
      <div className="gradient-overlay"></div>
      <div className="status-bar">
         <div className="time">9:41</div>
      </div>
      
      <div className="header-frame">
          {/* 뒤로가기 시 'scanning'으로 이동 (재촬영 등 필요 시) */}
          <div className="back-arrow" onClick={() => setStep('scanning')}>
             <img src={`${process.env.PUBLIC_URL}/assets/icons/arrow-left.svg`} alt="Back" style={{filter: "invert(1)"}} />
          </div>
      </div>

      <div className="scan-complete">Analysis Complete</div>
      
      <div className="photo-preview"></div>

      {/* 완료 시 Home으로 복귀(onBack) */}
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