import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import Home from './screens/Home/Home';
import Chat from './screens/Chat/Chat';
import VoiceInput from './screens/VoiceInput/VoiceInput';
import KnockDetector from './screens/VoiceInput/KnockDetector';
// 1. 경로를 'screens' (복수형) 및 'camera' (소문자)로 수정합니다.
import CameraScreen from './screens/camera/CameraScreen';
import WelcomeScreen from './screens/welcome/WelcomeScreen';

// LED 서비스 임포트
import ledService from './services/LEDService';

function App() {
  const [view, setView] = useState('welcome');
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [time, setTime] = useState('');
  const [location, setLocation] = useState('Fetching location...');
  const [coords, setCoords] = useState(null);
  const [weather, setWeather] = useState(null);
  // const [uid, setUid] = useState('user01');
  // 1. UID를 state로 관리하도록 변경
  const [uid, setUid] = useState('testUser1'); // 기본값을 testUser1로 설정

  // 진행 중인 요청을 추적하기 위한 ref
  const abortControllerRef = useRef(null);
  const thinkingTimerRef = useRef(null);

  // 현재 화면을 추적하기 위한 state 추가 (App.js 상단에)
  const [previousView, setPreviousView] = useState('home');

  const [currentScreen, setCurrentScreen] = useState('home'); // 'home', 'chat', 'camera'

  useEffect(() => {
    const now = new Date();
    const h = now.getHours().toString().padStart(2, '0');
    const m = now.getMinutes().toString().padStart(2, '0');
    setTime(`${h}:${m}`);

    // 위치 정보 가져오기 및 주소 변환
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setCoords({ latitude, longitude });

        try {
          const res = await fetch('http://localhost:4000/reverse-geocode', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ latitude, longitude })
          });
          const data = await res.json();
          setLocation(data.region || '주소를 찾을 수 없음');
        } catch (err) {
          console.error('📍 주소 요청 실패:', err);
          setLocation('주소 요청 실패');
        }

        try {
          const res = await fetch('http://localhost:4000/weather', { //http로 변경
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ latitude, longitude })
          });
          const data = await res.json();
          setWeather(data);
        } catch (err) {
          console.error('🌧️날씨 정보 오류:', err);
        }
      },
      () => {
        setLocation('위치 정보 접근 거부됨');
      }
    );
  }, []);

  // 뒤로가기 함수 - 진행 중인 요청 취소 및 완전한 상태 초기화
  const handleBackToHome = () => {
    console.log('🔙 뒤로가기 시작 - 모든 상태 초기화');

    // 1. 진행 중인 HTTP 요청 취소
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      console.log('⏹️ HTTP 요청 취소됨');
    }

    // 2. 진행 중인 타이머 취소
    if (thinkingTimerRef.current) {
      clearTimeout(thinkingTimerRef.current);
      thinkingTimerRef.current = null;
      console.log('⏰ Thinking 타이머 취소됨');
    }

    // 3. 상태 즉시 초기화 (동기적으로)
    setView('home');
    setMessages([]);
    setInput('');

    console.log('✅ 모든 상태 초기화 완료');
  };

  // // Gemini 호출 + 그래프 통합 - AbortController로 요청 취소 가능하게 수정
  // const callGeminiAPI = async (messageText) => {
  //   try {
  //     // 이전 요청이 있다면 취소
  //     if (abortControllerRef.current) {
  //       abortControllerRef.current.abort();
  //     }

  //     // 새로운 AbortController 생성
  //     abortControllerRef.current = new AbortController();
  //     const signal = abortControllerRef.current.signal;

  //     let thinkingShown = false;
  //     let thinkingStartTime = null;

  //     // 800ms 후에 "Thinking" 메시지 표시
  //     thinkingTimerRef.current = setTimeout(() => {
  //       // 요청이 취소되지 않았을 때만 Thinking 표시
  //       if (!signal.aborted) {
  //         setMessages(prev => [...prev, { type: 'bot', text: 'Thinking', isThinking: true }]);
  //         thinkingShown = true;
  //         thinkingStartTime = Date.now();
  //       }
  //     }, 800);

  //     const res = await fetch('http://localhost:4000/gemini', {
  //       method: 'POST',
  //       headers: { 'Content-Type': 'application/json' },
  //       body: JSON.stringify({ userInput: messageText, location, coords }),
  //       signal // AbortController 신호 추가
  //     });

  //     // 요청이 취소되었다면 여기서 중단
  //     if (signal.aborted) {
  //       console.log('🚫 요청이 취소되었습니다.');
  //       return;
  //     }

  //     // API 응답이 빨리 와서 "Thinking"이 표시되기 전이면 타이머 취소
  //     if (thinkingTimerRef.current) {
  //       clearTimeout(thinkingTimerRef.current);
  //       thinkingTimerRef.current = null;
  //     }

  //     const data = await res.json();
  //     const graphCoords = data.resolvedCoords || coords;
  //     console.log('📍 resolvedCoords:', graphCoords);

  //     // 미세먼지 정보가 포함되어 있으면 추가 메시지 구성
  //     if (data.airQuality && data.airQuality.pm25 !== undefined) {
  //       const { pm25 } = data.airQuality;

  //       const getAirLevel = (value) => {
  //         if (value <= 15) return '좋음';
  //         if (value <= 35) return '보통';
  //         if (value <= 75) return '나쁨';
  //         return '매우 나쁨';
  //       };

  //       const getAirColor = (value) => {
  //         if (value <= 15) return '#22c55e';   // green
  //         if (value <= 35) return '#facc15';   // yellow
  //         if (value <= 75) return '#f97316';   // orange
  //         return '#ef4444';                    // red
  //       };

  //       const dustInfo = {
  //         value: pm25,
  //         level: getAirLevel(pm25),
  //         color: getAirColor(pm25)
  //       };

  //       // '생각 중...' 메시지 제거 후 응답 메시지 + dust 정보 반영
  //       setMessages(prev => {
  //         const newMessages = [...prev];
  //         newMessages.pop(); // 로딩 제거
  //         return [...newMessages, {
  //           type: 'bot',
  //           text: data.reply,
  //           dust: dustInfo
  //         }];
  //       });

  //       return; // 미세먼지 응답이면 여기서 종료
  //     }

  //     // 기온 질문 시 그래프 요청
  //     let graphData = null;
  //     if (
  //       (messageText.includes('기온') || messageText.includes('온도')) &&
  //       graphCoords && graphCoords.lat && graphCoords.lon &&
  //       !signal.aborted // 취소되지 않았을 때만
  //     ) {
  //       const graphRes = await fetch('http://localhost:4000/weather-graph', {
  //         method: 'POST',
  //         headers: { 'Content-Type': 'application/json' },
  //         body: JSON.stringify({
  //           latitude: graphCoords.lat,
  //           longitude: graphCoords.lon
  //         }),
  //         signal // 그래프 요청에도 취소 신호 추가
  //       });

  //       if (!signal.aborted) {
  //         graphData = await graphRes.json();
  //       }
  //     }

  //     // 최종 응답 처리
  //     const processResponse = () => {
  //       // 요청이 취소되었다면 상태 업데이트 하지 않음
  //       if (signal.aborted) {
  //         console.log('🚫 응답 처리 중단됨 (요청 취소)');
  //         return;
  //       }

  //       setMessages(prev => {
  //         const newMessages = [...prev];

  //         // "Thinking"이 표시되었으면 제거
  //         if (thinkingShown && newMessages[newMessages.length - 1]?.isThinking) {
  //           newMessages.pop();
  //         }

  //         return [
  //           ...newMessages,
  //           {
  //             type: 'bot',
  //             text: data.reply || '응답을 이해하지 못했어요.',
  //             graph: Array.isArray(graphData?.hourlyTemps) ? graphData.hourlyTemps : null
  //           }
  //         ];
  //       });
  //     };

  //     if (thinkingShown && thinkingStartTime && !signal.aborted) {
  //       const elapsed = Date.now() - thinkingStartTime;
  //       const minDisplayTime = 1000;
  //       const remainingTime = Math.max(0, minDisplayTime - elapsed);

  //       setTimeout(() => {
  //         if (!signal.aborted) {
  //           processResponse();
  //         }
  //       }, remainingTime);
  //     } else if (!signal.aborted) {
  //       processResponse();
  //     }

  //     if (data.error && !signal.aborted) {
  //       console.error('API 오류:', data.error);

  //       const processError = () => {
  //         if (signal.aborted) return;

  //         setMessages(prev => {
  //           const newMessages = [...prev];

  //           if (thinkingShown && newMessages[newMessages.length - 1]?.isThinking) {
  //             newMessages.pop();
  //           }

  //           return [...newMessages, {
  //             type: 'bot',
  //             text: `❌ 오류: ${data.error}`
  //           }];
  //         });
  //       };

  //       if (thinkingShown && thinkingStartTime) {
  //         const elapsed = Date.now() - thinkingStartTime;
  //         const minDisplayTime = 1000;
  //         const remainingTime = Math.max(0, minDisplayTime - elapsed);
  //         setTimeout(processError, remainingTime);
  //       } else {
  //         processError();
  //       }
  //     }

  //     // 요청 완료 후 AbortController 정리
  //     abortControllerRef.current = null;

  //   } catch (error) {
  //     // AbortError는 정상적인 취소이므로 에러 메시지 표시하지 않음
  //     if (error.name === 'AbortError') {
  //       console.log('🚫 요청이 사용자에 의해 취소되었습니다.');
  //       return;
  //     }

  //     const processErrorCatch = () => {
  //       setMessages(prev => {
  //         const newMessages = [...prev];

  //         if (newMessages[newMessages.length - 1]?.isThinking) {
  //           newMessages.pop();
  //         }

  //         return [...newMessages, {
  //           type: 'bot',
  //           text: `❌ ${error.message}`
  //         }];
  //       });
  //     };

  //     processErrorCatch();

  //     // 에러 발생 시에도 AbortController 정리
  //     abortControllerRef.current = null;
  //   }
  // };

  // ✨ API 호출 함수 (새로운 백엔드 아키텍처에 맞게 대폭 수정됨) ✨
  // ==================================================================
  const callGeminiAPI = async (messageText) => {
    // 이전 요청이 있다면 취소
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    // "Thinking..." 메시지 표시 로직
    let thinkingShown = false;
    thinkingTimerRef.current = setTimeout(() => {
      if (signal.aborted) return;
      setMessages(prev => [...prev, { type: 'bot', text: 'Thinking', isThinking: true }]);
      thinkingShown = true;
    }, 800);

    try {
      // ✅ 엔드포인트를 /chat으로 변경하고, uid를 함께 전송합니다.
      const res = await fetch('http://localhost:4000/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userInput: messageText, location, coords, uid: uid }), //🔥 하드코딩된 값 대신 state 사용
        signal // AbortController 신호 추가
      });

      // API 응답이 빨리 오면 Thinking 타이머 취소
      clearTimeout(thinkingTimerRef.current);

      if (signal.aborted) return;

      const data = await res.json();

      // [핵심 기능] 백엔드에서 받은 LED 상태를 아두이노로 즉시 전송
      if (data.ledStatus) {
        console.log('🎨 채팅 기반 LED 업데이트:', data.ledStatus);
        ledService.sendToArduino(data.ledStatus);
      }

      // "Thinking" 메시지를 실제 응답으로 교체
      setMessages(prev => {
        const newMessages = [...prev];
        // Thinking 메시지가 있다면 제거
        if (thinkingShown && newMessages[newMessages.length - 1]?.isThinking) {
          newMessages.pop();
        }
        // 백엔드에서 받은 데이터로 새 메시지 추가
        return [
          ...newMessages,
          {
            type: 'bot',
            text: data.reply || '응답을 이해하지 못했어요.',
            // 백엔드가 그래프/미세먼지 데이터를 주면 그대로 할당
            graph: data.graph || null,
            graphDate: data.graphDate || null,
            dust: data.dust || null
          }
        ];
      });

    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('🚫 요청이 사용자에 의해 취소되었습니다.');
        return;
      }
      // 그 외 네트워크 오류 등 처리
      clearTimeout(thinkingTimerRef.current);
      setMessages(prev => {
        const newMessages = [...prev].filter(m => !m.isThinking);
        return [...newMessages, { type: 'bot', text: `❌ 오류가 발생했어요: ${error.message}` }];
      });
    } finally {
      abortControllerRef.current = null;
    }
  };

  // 통합된 메시지 전송 함수
  const sendMessage = async (messageText, fromInput = false) => {
    const userMsg = { type: 'user', text: messageText };
    setMessages(prev => [...prev, userMsg]);

    if (fromInput) {
      setInput('');
    }

    setView('chat');
    await callGeminiAPI(messageText);
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    await sendMessage(input, true);
  };

  const sendFromFAQ = async (text) => {
    await sendMessage(text, false);
  };

  const handleVoiceInput = () => { // 음성인식 화면으로 전환하는 함수
    setPreviousView(view); // 현재 화면을 이전 화면으로 저장
    setView('listening');
  };

  // KnockDetector가 호출할 onKnock 함수를 정의합니다.
  // 이 함수가 바로 음성인식을 켜는 역할을 합니다.
  const onKnock = () => {
    console.log('App.js: 노크 신호를 받아 음성인식을 시작합니다.');
    handleVoiceInput();
  };


  // 기존 useEffect들 아래에 이 코드를 추가하세요

  // 메시지가 업데이트될 때마다 스크롤을 맨 아래로
  useEffect(() => {
    const messagesContainer = document.querySelector('.messages');
    if (messagesContainer && messages.length > 0) {
      // 부드러운 스크롤로 맨 아래로 이동
      messagesContainer.scrollTo({
        top: messagesContainer.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages]); // messages 배열이 변경될 때마다 실행

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (thinkingTimerRef.current) {
        clearTimeout(thinkingTimerRef.current);
      }
    };
  }, []);

  return (
    <div className={`app ${view}`}>
      <KnockDetector onKnock={onKnock} />
      {view === 'welcome' && (
        <WelcomeScreen setView={setView} setUid={setUid} />
      )}
      {view === 'home' && (
        <Home
          time={time}
          location={location}
          input={input}
          setInput={setInput}
          handleSend={handleSend}
          sendFromFAQ={sendFromFAQ}
          handleVoiceInput={handleVoiceInput}
          weather={weather}
          uid={uid}
          setUid={setUid}
          setView={setView} // 2. setView prop 전달
        />
      )}
      {view === 'chat' && (
        <Chat
          messages={messages}
          input={input}
          setInput={setInput}
          handleSend={handleSend}
          onBackToHome={handleBackToHome}
          handleVoiceInput={handleVoiceInput}
          onCameraClick={() => setView('camera')}
        />
      )}


      {view === 'listening' && (
        <VoiceInput
          setView={setView}
          previousView={previousView} // 이전 화면 정보 전달
          onResult={async (text) => {
            console.log('🎤 음성 결과 받음:', text);

            // 즉시 메시지 전송 (지연 없음)
            try {
              await sendMessage(text, false);
            } catch (error) {
              console.error('메시지 전송 실패:', error);
            }
          }}
        />
      )}

      {/* 3. 'camera' 뷰 렌더링 로직 추가 */}
      {view === 'camera' && (
        <CameraScreen
          onBack={() => setView('chat')} // 채팅에서 카메라로 왔으므로 채팅으로 돌아감
          uid={uid}
        />
      )}
    </div>



  );
}

export default App;