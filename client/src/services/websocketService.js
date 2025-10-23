class WebSocketService {
  constructor() {
    this.ws = null;
    this.listeners = {};
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
  }

  connect(userId) {
    return new Promise((resolve, reject) => {
      try {
        // Use production URL if available
        const wsUrl = import.meta.env.VITE_API_URL 
          ? import.meta.env.VITE_API_URL.replace('https://', 'wss://').replace('http://', 'ws://')
          : 'ws://localhost:5000';

        this.ws = new WebSocket(`${wsUrl}?userId=${userId}`);


        this.ws.onopen = () => {
          console.log('✅ WebSocket connected');
          this.reconnectAttempts = 0;
          resolve();
        };

        this.ws.onmessage = (event) => {
          const data = JSON.parse(event.data);
          this.handleMessage(data);
        };

        this.ws.onerror = (error) => {
          console.error('❌ WebSocket error:', error);
          reject(error);
        };

        this.ws.onclose = () => {
          console.log('🔌 WebSocket disconnected');
          this.handleReconnect(userId);
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  handleMessage(data) {
    const { type } = data;
    
    // Notify all listeners for this message type
    if (this.listeners[type]) {
      this.listeners[type].forEach(callback => callback(data));
    }

    // Also notify 'all' listeners
    if (this.listeners['all']) {
      this.listeners['all'].forEach(callback => callback(data));
    }
  }

  on(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }

  off(event, callback) {
    if (this.listeners[event]) {
      this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
    }
  }

  send(data) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    } else {
      console.error('WebSocket is not connected');
    }
  }

  sendAudio(audioBuffer) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      // Convert audio to base64 for transmission
      const base64Audio = this.arrayBufferToBase64(audioBuffer);
      this.send({
        type: 'audio',
        data: base64Audio
      });
    }
  }

  arrayBufferToBase64(buffer) {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }

  handleReconnect(userId) {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`🔄 Reconnecting... Attempt ${this.reconnectAttempts}`);
      setTimeout(() => {
        this.connect(userId);
      }, 2000 * this.reconnectAttempts);
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}

export default new WebSocketService();
