// src/app/services/websocket.ts
class WebSocketService {
    private socket: WebSocket | null = null;
    private listeners: Map<string, Set<(data: any) => void>> = new Map();

    async connect() {
        try {
            const apiUrl = await this.getApiUrl();
            const wsUrl = apiUrl.replace('http', 'ws').replace('https', 'wss');
            
            this.socket = new WebSocket(wsUrl);
            
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
                setTimeout(() => this.connect(), 5000);
            };
        } catch (error) {
            console.error('WebSocket connection error:', error);
            setTimeout(() => this.connect(), 5000);
        }
    }

    private async getApiUrl() {
        try {
            const healthCheck = await fetch('http://localhost:5000/api/health');
            if (healthCheck.ok) {
                return 'http://localhost:5000';
            }
        } catch {
            console.log('Local backend not available, using Render backend');
        }
        return 'https://lebaincode-backend.onrender.com';
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