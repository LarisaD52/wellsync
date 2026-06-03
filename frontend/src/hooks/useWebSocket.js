// src/hooks/useWebSocket.js
// ─────────────────────────────────────────────────────────────
// Silver Challenge: connects to the backend WebSocket and
// updates the master/detail view + charts when faker pushes
// new data.
// ─────────────────────────────────────────────────────────────

import { useEffect, useRef, useState } from "react";

// Derive WS URL from VITE_API_BASE env variable
const _apiBase = import.meta.env.VITE_API_BASE || "https://localhost:3001/api";
const WS_URL = _apiBase.replace(/\/api$/, "").replace(/^https/, "wss").replace(/^http/, "ws");

export function useWebSocket(onBatch) {
  const wsRef           = useRef(null);
  const [wsStatus, setWsStatus] = useState("disconnected"); // connected | disconnected | error
  const onBatchRef      = useRef(onBatch);
  onBatchRef.current    = onBatch;

  useEffect(() => {
    let reconnectTimer = null;

    function connect() {
      try {
        const ws = new WebSocket(WS_URL);
        wsRef.current = ws;

        ws.onopen = () => {
          setWsStatus("connected");
          console.log("[WS] Connected to WellSync server");
        };

        ws.onmessage = (event) => {
          try {
            const msg = JSON.parse(event.data);

            if (msg.type === "faker_batch") {
              console.log(`[WS] Faker batch #${msg.batchCount} — ${msg.batch.length} new resources`);
              onBatchRef.current?.(msg.batch, msg.total);
            }

            if (msg.type === "faker_stopped") {
              console.log(`[WS] Faker stopped after ${msg.batchCount} batches`);
            }
          } catch {
            console.warn("[WS] Could not parse message");
          }
        };

        ws.onerror = () => {
          setWsStatus("error");
        };

        ws.onclose = () => {
          setWsStatus("disconnected");
          console.log("[WS] Disconnected — retrying in 5s");
          reconnectTimer = setTimeout(connect, 5000);
        };
      } catch {
        setWsStatus("error");
        reconnectTimer = setTimeout(connect, 5000);
      }
    }

    connect();

    return () => {
      clearTimeout(reconnectTimer);
      if (wsRef.current) {
        wsRef.current.onclose = null; // prevent reconnect on unmount
        wsRef.current.close();
      }
    };
  }, []);

  return { wsStatus };
}
