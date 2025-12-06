import React, { useState, useEffect, useRef } from 'react';
import './Home.css';
import { WeatherDescriptionWithIcon } from './weatherIconUtils';

const Home = ({ 
  time, 
  location, 
  input, 
  setInput, 
  handleSend, 
  sendFromFAQ, 
  handleVoiceInput,
  weather,
  uid,
  setUid,
  setView // 1. setView prop 받기
}) => {

  // ===== 🔥 새로 추가: 사용자 프로필 관리 =====
  const userProfiles = {
    'testUser1': {
      name: 'Minseo',
      image: `${process.env.PUBLIC_URL}/assets/icons/minseo_home.png`,
      greeting: 'Hello, Minseo👋'
    },
    'testUser2': {
      name: 'Minjun',
      image: `${process.env.PUBLIC_URL}/assets/icons/minjun_home.png`, // 🔥 민준 이미지 추가 
      greeting: 'Hello, Minjun👋'
    }
  };

  const currentUser = userProfiles[uid] || userProfiles['testUser1'];

  // ===== 🔥 각 유저별 캘린더 데이터 =====
  const calendarData = {
    testUser1: {
      month: 'December',
      days: ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'],
      dates: ['14', '15', '16', '17', '18', '19', '20'],
      events: {
        '16': ['성수', '카페 탐방'],
        '17': ['마라톤'],
        '20': ['결혼식'],
      }
    },
    testUser2: {
      month: 'December',
      days: ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'],
      dates: ['14', '15', '16', '17', '18', '19', '20'],
      events: {
        '14': ['수원FC', '축구 직관'],
        '17': ['가평 캠핑'],
        '19': ['설악산', '등산'],
      }
    }
  };

  const currentCalendar = calendarData[uid] || calendarData['testUser1'];

// ===== 🔥 FAQ / 캘린더 슬라이드 상태 =====
const [activeSlide, setActiveSlide] = useState(0); // 0 = FAQ, 1 = Calendar
const pointerStartXRef = useRef(null);

const handlePointerDown = (e) => {
  // 사이드 메뉴 열려 있으면 슬라이드 막기
  if (isMenuOpen) return;

  // 마우스면 왼쪽 버튼만 허용
  if (e.pointerType === 'mouse' && e.button !== 0) return;

  const target = e.target;

  // 입력창/마이크/카메라/사이드메뉴 안에서 시작한 드래그는 무시
  if (
    target.closest('.footer-input') ||
    target.closest('.side-menu') ||
    target.closest('.menu-overlay')
  ) {
    pointerStartXRef.current = null;
    return;
  }

  pointerStartXRef.current = e.clientX;
};

const handlePointerUp = (e) => {
  if (pointerStartXRef.current === null) return;

  const endX = e.clientX;
  const diffX = endX - pointerStartXRef.current;

  // 살짝 스치는 건 무시
  if (Math.abs(diffX) < 40) {
    pointerStartXRef.current = null;
    return;
  }

  if (diffX < 0 && activeSlide === 0) {
    // 왼쪽으로 드래그 → 캘린더
    setActiveSlide(1);
  } else if (diffX > 0 && activeSlide === 1) {
    // 오른쪽으로 드래그 → FAQ
    setActiveSlide(0);
  }

  pointerStartXRef.current = null;
};

  // ===== 🔥 프로필 전환 함수 =====
  const switchProfile = () => {
    const newUid = uid === 'testUser1' ? 'testUser2' : 'testUser1';
    setUid(newUid);
    console.log(`🔄 프로필 전환: ${uid} → ${newUid}`);
  };

  // ===== 1. 날짜 포맷팅 =====
  const today = new Date();
  const formattedDate = formatDate(today);

  // ===== 2. FAQ 관련 상태 및 데이터 =====
  const defaultFaqItems = [
    "What's the weather like today?",
    "How's the air quality today?", 
    "Do I need an umbrella today?",
    "What should I wear today?"
  ];

  const [faqItems, setFaqItems] = useState(() => {
    try {
      const savedFaqItems = localStorage.getItem('lumeeFaqItems');
      return savedFaqItems ? JSON.parse(savedFaqItems) : defaultFaqItems;
    } catch (error) {
      console.error('FAQ 데이터 로드 실패:', error);
      return defaultFaqItems;
    }
  });
  
  const [editingIndex, setEditingIndex] = useState(null);
  const [editText, setEditText] = useState("");

  // ===== 3. 사이드 메뉴 관련 상태 =====
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // ===== 4. 마법 구슬 관련 데이터 및 상태 =====
  const orbOptions = [
    {
      id: 'default',
      name: 'Default',
      description: 'Original magic orb',
      videoSrc: {
        mp4: "https://res.cloudinary.com/dpuw0gcaf/video/upload/v1748854350/LumeeMagicOrb_Safari_rdmthi.mov",
        webm: "https://res.cloudinary.com/dpuw0gcaf/video/upload/v1748852283/LumeeMagicOrb_WEBM_tfqoa4.webm"
      }
    },
    {
      id: 'dust',
      name: 'Fine Dust',
      description: 'Fine dust-reactive magic orb',
      videoSrc: {
        mp4: "https://res.cloudinary.com/dpuw0gcaf/video/upload/v1749988390/finedustLumee_Safari_tkyral.mov",
        webm: "https://res.cloudinary.com/dpuw0gcaf/video/upload/v1749988390/finedustLumee_Chrome_filwol.webm"
      }
    },
    {
      id: 'rain',
      name: 'Rain',
      description: 'Rain-reactive magic orb',
      videoSrc: {
        mp4: "https://res.cloudinary.com/dpuw0gcaf/video/upload/v1749984449/rainLumee_Safari_iyfm0v.mov",
        webm: "https://res.cloudinary.com/dpuw0gcaf/video/upload/v1749984445/rainLumee_WEBM_xblf7o.webm"
      }
    }
  ];

  const [selectedOrb, setSelectedOrb] = useState(() => {
    try {
      const savedOrb = localStorage.getItem('lumeeSelectedOrb');
      return savedOrb || 'default';
    } catch (error) {
      console.error('구슬 설정 로드 실패:', error);
      return 'default';
    }
  });

   // ===== 4-1. FAQ 길게 누르기용 ref & 핸들러 =====
  const longPressTimerRef = useRef(null);
  const longPressTriggeredRef = useRef(false);
  const LONG_PRESS_DURATION = 600; // ms

  const handleFaqPressStart = (index) => {
    // 타이머 초기화
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
    }
    longPressTriggeredRef.current = false;

    longPressTimerRef.current = setTimeout(() => {
      longPressTriggeredRef.current = true;
      startEditing(index); // 일정 시간 지나면 편집 모드 진입
    }, LONG_PRESS_DURATION);
  };

  const handleFaqPressEnd = (faqText) => {
    // 타이머 제거
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }

    // 길게 누른 게 아니면 → 원래 기능(FAQ 전송)
    if (!longPressTriggeredRef.current) {
      sendFromFAQ(faqText);
    }
  };

  const cancelLongPress = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
    longPressTriggeredRef.current = false;
  };

  // ===== 5. useEffect - 로컬 스토리지 저장 =====
  useEffect(() => {
    try {
      localStorage.setItem('lumeeFaqItems', JSON.stringify(faqItems));
    } catch (error) {
      console.error('FAQ 데이터 저장 실패:', error);
    }
  }, [faqItems]);

  useEffect(() => {
    try {
      localStorage.setItem('lumeeSelectedOrb', selectedOrb);
    } catch (error) {
      console.error('구슬 설정 저장 실패:', error);
    }
  }, [selectedOrb]);

  // ===== 6. 사이드 메뉴 관련 함수 =====
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  // ===== 7. 마법 구슬 관련 함수 =====
  const selectOrb = (orbId) => {
    setSelectedOrb(orbId);
    closeMenu();
  };

  const getCurrentOrb = () => {
    return orbOptions.find(orb => orb.id === selectedOrb) || orbOptions[0];
  };

  // ===== 8. FAQ 편집 관련 함수 =====
  const startEditing = (index) => {
    setEditingIndex(index);
    setEditText(faqItems[index]);
  };

  const saveEdit = () => {
    if (editText.trim() === '') {
      alert('FAQ 내용을 입력해주세요!');
      return;
    }
    
    const newFaqItems = [...faqItems];
    newFaqItems[editingIndex] = editText.trim();
    setFaqItems(newFaqItems);
    setEditingIndex(null);
    setEditText("");
  };

  const cancelEdit = () => {
    setEditingIndex(null);
    setEditText("");
  };

  // ===== 9. 현재 선택된 구슬 정보 =====
  const currentOrb = getCurrentOrb();

  // ===== 10. 렌더링 =====
  return (
    <div className="app-container"
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
    >
      
      {/* ===== 사이드 메뉴 ===== */}
      {isMenuOpen && (
        <div className="menu-overlay" onClick={closeMenu}>
          <div className="side-menu" onClick={(e) => e.stopPropagation()}>
            
            {/* 메뉴 헤더 */}
            <div className="menu-header">
              <h3>
                Orb Selection 
                <span className="beta-badge">BETA</span>
              </h3>
              <button className="menu-close-btn" onClick={closeMenu}>
                <img 
                  src={`${process.env.PUBLIC_URL}/assets/icons/close.svg`}
                  alt="닫기"
                  className="close-icon"
                />
              </button>
            </div>
            
            {/* 구슬 옵션 목록 */}
            <div className="orb-options">
              {orbOptions.map((orb) => (
                <div 
                  key={orb.id} 
                  className={`orb-option ${selectedOrb === orb.id ? 'selected' : ''}`}
                  onClick={() => selectOrb(orb.id)}
                >
                  <div className="orb-preview">
                    <video
                      className="orb-preview-video"
                      autoPlay
                      loop
                      muted
                      playsInline
                    >
                      <source src={orb.videoSrc.mp4} type='video/mp4; codecs="hvc1"' />
                      <source src={orb.videoSrc.webm} type="video/webm" />
                    </video>
                  </div>
                  <div className="orb-info">
                    <h4>{orb.name}</h4>
                    <p>{orb.description}</p>
                  </div>
                </div>
              ))}
            </div>
            
            {/* 메뉴 푸터 */}
            <div className="menu-footer">
              <p className="beta-notice">This is a BETA feature. Auto-reactive orbs & more styles coming soon!</p>
            </div>
          </div>
        </div>
      )}

      {/* ===== 상단 헤더 ===== */}
      <header className="weather-header">
        {/* 왼쪽 메뉴 버튼 */}
        <button className="header-menu-btn" onClick={toggleMenu} aria-label="메뉴">
          <img 
            src={`${process.env.PUBLIC_URL}/assets/icons/menu.svg`}
            alt="메뉴"
            className="menu-icon"
          />
        </button>
        
        {/* 중앙 위치 */}
        <button className="header-location" aria-label="위치 새로고침">
          <img 
            src={`${process.env.PUBLIC_URL}/assets/icons/location.svg`}
            alt="위치"
            className="header-location-icon"
          />
          <span className="header-location-name">{location}</span>
        </button>
        
        {/* 🔥 수정된 프로필 버튼 */}
        <button className="header-profile" aria-label="프로필 전환" onClick={switchProfile}>
          <img 
            src={currentUser.image}
            alt={`${currentUser.name} 프로필`}
            className="profile-icon"
          />
        </button>
      </header>
      
      {/* ===== 날씨 정보 섹션 ===== */}
      <div className="home-weather-info">
        <p className="date">{formattedDate}</p>
        <p className="temperature">
          {weather ? `${weather.temp}°` : `00°C`}
        </p>
        <div className="description">
          <WeatherDescriptionWithIcon weather={weather} />
        </div>
        <p className="sub-summary">
          {weather ? 
            `Feels like ${weather.feelsLike}° | H: ${weather.tempMax}° L: ${weather.tempMin}°` 
            : 'Loading...'
          }
        </p>
      </div>

      {/* ===== 마법 구슬 영상 ===== */}
      <div className="background-media">
        <video
          className="lumee-magic-orb"
          autoPlay
          loop
          muted
          playsInline
          key={selectedOrb} // 키를 변경하여 비디오 리로드 강제
          controls={false}  
        >
          <source
            src={currentOrb.videoSrc.mp4}
            type='video/mp4; codecs="hvc1"'
          />
          <source
            src={currentOrb.videoSrc.webm}
            type="video/webm"
          />
        </video>
      </div>
 
      {/* ===== 🔥 수정된 사용자 인사 섹션 ===== */}
      <div className="user-greeting-section">
        <div className="greeting">{currentUser.greeting}</div>
        <h1 className="main-question">
          {activeSlide === 0
            ? 'What weather info do you need?'
            : 'Check the weekly schedule'}
        </h1>
      </div>

      {/* ===== FAQ / Calendar 슬라이더 섹션 ===== */}
      <div
        className="bottom-slider"
      >

        {activeSlide === 0 ? (
          /* === 슬라이드 1 : FAQ === */
          <div className="FAQ-buttons">
            {faqItems.map((faqText, index) => (
              <div key={index} className="FAQ-card">
                {editingIndex === index ? (
                  // 편집 모드
                  <div className="FAQ-edit-mode">
                    <textarea
                      className="FAQ-edit-input"
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      autoFocus
                    />
                    <div className="FAQ-edit-buttons">
                      <button className="FAQ-save-btn" onClick={saveEdit}>
                        Save
                      </button>
                      <button className="FAQ-cancel-btn" onClick={cancelEdit}>
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  // 일반 모드
                  <>
                    <button 
                      className="FAQ-button"

                      onMouseDown={() => handleFaqPressStart(index)}
                      onMouseUp={() => handleFaqPressEnd(faqText)}
                      onMouseLeave={cancelLongPress}

                      onTouchStart={() => handleFaqPressStart(index)}
                      onTouchEnd={() => handleFaqPressEnd(faqText)}
                      onTouchMove={cancelLongPress}
                    >
                      <span className="FAQ-button-text">{faqText}</span>
                    </button>
                    {/*
                    <button 
                      className="FAQ-edit-btn"
                      onClick={() => startEditing(index)}
                      aria-label="FAQ 수정"
                    >
                      <img 
                        src={`${process.env.PUBLIC_URL}/assets/icons/edit.svg`}
                        alt="수정"
                        className="edit-icon"
                      />
                    </button>
                    */}
                  </>
                )}
              </div>
            ))}
          </div>
        ) : (
          /* === 슬라이드 2 : 캘린더 === */
          <div className="calendar-section">
            <div className="calendar-month">{currentCalendar.month}</div>

            <div className="calendar-card">
              {/* 요일 줄 */}
              <div className="calendar-days-row">
                {currentCalendar.days.map((day) => (
                  <span key={day} className="calendar-day-label">
                    {day}
                  </span>
                ))}
              </div>

              {/* 날짜 + 일정 줄 */}
              <div className="calendar-dates-row">
                {currentCalendar.dates.map((date, index) => {
                  const eventLines = currentCalendar.events[date] || [];
                  const isSelected = index === 6; // 토요일(20) 강조
                  return (
                    <div
                      key={date}
                      className={`calendar-date-item ${
                        isSelected ? 'is-selected' : ''
                      }`}
                    >
                      <span className="calendar-date-number">{date}</span>
                      <div className="calendar-event-text">
                        {eventLines.map((line, i) => (
                          <span key={i}>{line}</span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* 슬라이드 인디케이터 점 */}
        <div className="slider-dots">
          <button
            type="button"
            className={`slider-dot ${activeSlide === 0 ? 'active' : ''}`}
            onClick={() => setActiveSlide(0)}
          />
          <button
            type="button"
            className={`slider-dot ${activeSlide === 1 ? 'active' : ''}`}
            onClick={() => setActiveSlide(1)}
          />
        </div>
      </div>


      {/* ===== 하단 입력창 (수정됨) ===== */}
      <div className="footer-input">
        <div className="input-wrapper">
          {/* 2. 카메라 버튼 추가 및 setView 연결 */}
          <button className="plus-button" onClick={() => setView('camera')}>
            <img 
              src={`${process.env.PUBLIC_URL}/assets/icons/Camera.svg`}
              alt="카메라연결"
            />
          </button>
          <input
            type="text"
            placeholder="Ask Lumee about the weather..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          />
          <button className="mic-button" onClick={handleVoiceInput}>
            <img 
              src={`${process.env.PUBLIC_URL}/assets/icons/microphone.svg`}
              alt="음성입력"
            />
          </button>
        </div>
        <button className="send-button" onClick={handleSend}>
          <img 
            src={`${process.env.PUBLIC_URL}/assets/icons/send.svg`}
            alt="전송"
          />
        </button>
      </div>
    </div>
  );
};

// ===== 날짜 포맷팅 유틸리티 함수 =====
function formatDate(date) {
  const options = { month: 'short', day: 'numeric', weekday: 'long' };
  const parts = new Intl.DateTimeFormat('en-US', options).formatToParts(date);

  const month = parts.find(p => p.type === 'month').value;
  const day = parts.find(p => p.type === 'day').value;
  const weekday = parts.find(p => p.type === 'weekday').value;

  return `${month} ${day}, ${weekday}`;
}

export default Home;