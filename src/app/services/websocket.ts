// src/app/services/websocket.ts
class WebSocketService {
    private socket: WebSocket | null = null;
    private listeners: Map<string, Set<(data: any) => void>> = new Map();

    connect() {
        const baseUrl = window.location.hostname === 'localhost' 
            ? 'ws://localhost:5000'
            : 'wss://lebaincode-backend.onrender.com';

        this.socket = new WebSocket(baseUrl);

        this.socket.onopen = () => {
            console.log('WebSocket connected');
        };

        this.socket.onmessage = (event) => {
            try {
                const { type, data } = JSON.parse(event.data);
                this.notifyListeners(type, data);
            } catch (error) {
                console.error('WebSocket message error:', error);
            }
        };

        this.socket.onerror = (error) => {
            console.error('WebSocket error:', error);
        };

        this.socket.onclose = () => {
            console.log('WebSocket disconnected');
            // Attempt to reconnect after 5 seconds
            setTimeout(() => this.connect(), 5000);
        };
    }

    subscribe(type: string, callback: (data: any) => void) {
        if (!this.listeners.has(type)) {
            this.listeners.set(type, new Set());
        }
        this.listeners.get(type)?.add(callback);
    }

    unsubscribe(type: string, callback: (data: any) => void) {
        this.listeners.get(type)?.delete(callback);
    }

    private notifyListeners(type: string, data: any) {
        this.listeners.get(type)?.forEach(callback => callback(data));
    }

    send(type: string, data: any) {
        if (this.socket?.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify({ type, data }));
        }
    }
}

export const wsService = new WebSocketService();