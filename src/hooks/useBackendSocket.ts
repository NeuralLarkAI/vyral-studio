import { useEffect } from "react";

const API_BASE =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8787";

export function useBackendSocket(onEvent: (event: any) => void) {
  useEffect(() => {
    const wsUrl = API_BASE.replace("http", "ws") + "/ws";
    const ws = new WebSocket(wsUrl);

    ws.onmessage = (msg) => {
      try {
        const data = JSON.parse(msg.data);
        onEvent(data);
      } catch (e) {
        console.error("Invalid WS message", e);
      }
    };

    ws.onerror = (err) => {
      console.error("WebSocket error", err);
    };

    return () => ws.close();
  }, []);
}

