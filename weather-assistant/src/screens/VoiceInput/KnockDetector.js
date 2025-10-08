// src/screens/KnockDetector.js

import React, { useState, useEffect } from 'react';

const KnockDetector = ({ onKnock }) => {
    const [status, setStatus] = useState('Disconnected');

    useEffect(() => {
        // 로컬 PC에서 실행 중인 중계 서버(bridge.js)에 연결
        const ws = new WebSocket('ws://localhost:4000');

        ws.onopen = () => {
            console.log('중계 서버와 연결되었습니다.');
            setStatus('Connected');
        };

        // 중계 서버로부터 메시지 수신
        ws.onmessage = (event) => {
            const message = event.data;
            console.log('수신된 신호:', message);
            if (message === 'KNOCK') {
                console.log('✊ KNOCK DETECTED!');
                if (onKnock) onKnock();
            }
        };

        ws.onclose = () => {
            console.log('중계 서버와 연결이 끊겼습니다.');
            setStatus('Disconnected');
        };

        ws.onerror = (error) => {
            console.error('웹소켓 오류:', error);
            setStatus('Error');
        };

        // 컴포넌트가 사라질 때 연결을 정리
        return () => {
            ws.close();
        };
    }, [onKnock]);

    // UI는 간단하게 상태만 표시
    return (
        <div style={{
            position: 'fixed', bottom: '20px', right: '20px', zIndex: 1000,
            backgroundColor: 'rgba(255, 255, 255, 0.8)', padding: '10px',
            borderRadius: '10px', boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
        }}>
            <p style={{ margin: 0, fontWeight: 'bold' }}>
                아두이노 연결 상태: 
                <span style={{ color: status === 'Connected' ? 'green' : 'red' }}>
                    {status}
                </span>
            </p>
        </div>
    );
};

export default KnockDetector;