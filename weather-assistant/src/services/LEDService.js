/**
 * LEDService.js
 * Web Bluetooth API를 사용하여 아두이노(HM-10)와 직접 통신
 */

class LEDService {
  constructor() {
    this.device = null;
    this.server = null;
    this.service = null;
    this.characteristic = null;
    this.isConnected = false;

    // HM-10 모듈의 기본 UUID
    this.SERVICE_UUID = '0000ffe0-0000-1000-8000-00805f9b34fb';
    this.CHARACTERISTIC_UUID = '0000ffe1-0000-1000-8000-00805f9b34fb';
  }

  /**
   * 초기화
   */
  async initialize() {
    if (!navigator.bluetooth) {
      console.error("Web Bluetooth API is not available in this browser.");
      return false;
    }
    return true;
  }

  /**
   * 블루투스 기기 연결 (반드시 사용자의 클릭 이벤트 내에서 호출되어야 함)
   */
  async connect() {
    try {
      if (this.isConnected) {
        console.log('✅ 이미 연결되어 있습니다.');
        return true;
      }

      console.log('🔵 블루투스 장치 검색 중...');
      
      // 1. 장치 요청 (브라우저 팝업 뜸)
      this.device = await navigator.bluetooth.requestDevice({
        filters: [
          { namePrefix: 'HM' },    // HM-10 기본 이름
          { namePrefix: 'Lumee' }, // 혹시 이름을 바꿨다면
          { namePrefix: 'BT05' }   // 유사 모듈
        ],
        optionalServices: [this.SERVICE_UUID]
      });

      console.log(`✅ 장치 선택됨: ${this.device.name}`);
      
      // 연결 해제 이벤트 리스너
      this.device.addEventListener('gattserverdisconnected', this.onDisconnected.bind(this));

      // 2. GATT 서버 연결
      this.server = await this.device.gatt.connect();
      console.log('🔗 GATT 서버 연결됨');

      // 3. 서비스 가져오기
      this.service = await this.server.getPrimaryService(this.SERVICE_UUID);

      // 4. 특성(Characteristic) 가져오기 - 여기에 데이터를 씁니다
      this.characteristic = await this.service.getCharacteristic(this.CHARACTERISTIC_UUID);

      this.isConnected = true;
      console.log('✅ 블루투스 연결 및 준비 완료!');

      // 🔥 [핵심 수정] 연결 성공 시 '초록색 깜빡임' 대신 '루미 그라데이션' 전송
      await this.sendToArduino({
        r: 135, g: 206, b: 235, // 기본 색상 (하늘색)
        effect: "gradient",     // 아두이노에 정의된 그라데이션 효과 실행
        duration: 0,            // 무한 지속
        priority: 10
      });

      return true;

    } catch (error) {
      console.error('❌ 블루투스 연결 실패:', error);
      return false;
    }
  }

  /**
   * 연결 해제 처리
   */
  onDisconnected() {
    console.log('⚠️ 블루투스 연결이 끊어졌습니다.');
    this.isConnected = false;
    this.device = null;
    this.server = null;
    this.service = null;
    this.characteristic = null;
  }

  /**
   * 아두이노로 데이터 전송 (JSON 문자열)
   */
  async sendToArduino(data) {
    if (!this.isConnected || !this.characteristic) {
      console.warn('⚠️ 블루투스가 연결되지 않았습니다.');
      return false;
    }

    try {
      // JSON 객체를 문자열로 변환하고 줄바꿈 문자 추가
      const jsonString = JSON.stringify(data) + '\n';
      console.log(`📤 전송: ${jsonString.trim()}`);

      // 문자열을 바이트 배열로 인코딩
      const encoder = new TextEncoder();
      const value = encoder.encode(jsonString);

      // HM-10은 한 번에 20바이트까지만 전송 가능하므로 쪼개서 보냄
      for (let i = 0; i < value.length; i += 20) {
        const chunk = value.slice(i, i + 20);
        await this.characteristic.writeValue(chunk);
        // 패킷 간 약간의 딜레이
        await new Promise(resolve => setTimeout(resolve, 50));
      }
      
      return true;

    } catch (error) {
      console.error('❌ 데이터 전송 오류:', error);
      return false;
    }
  }

  /**
   * 현재 연결 상태 반환
   */
  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      deviceName: this.device ? this.device.name : null
    };
  }
}

const ledService = new LEDService();
export default ledService;