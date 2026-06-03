// src/hooks/useApi.js
import { useState, useEffect, useCallback, useRef } from "react";

const API_BASE = import.meta.env.VITE_API_BASE || "https://localhost:3001/api";
const SYNC_INTERVAL = 5000;

export function useApi(initialResources = [], sessionId = null, token = null, onUnauthorized = null) {
  const [resources, setResources] = useState(initialResources);
  const [isOnline, setIsOnline]   = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [nextId, setNextId]       = useState(initialResources.length + 1);
  const pendingQueue              = useRef([]);

  function authHeaders() {
    const headers = { "Content-Type": "application/json" };
    if (sessionId) headers["x-session-id"] = sessionId;
    if (token)     headers["Authorization"] = `Bearer ${token}`;
    return headers;
  }

  function handleUnauthorized() {
    if (onUnauthorized) onUnauthorized();
  }

  const checkOnline = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/health`, { signal: AbortSignal.timeout(2000) });
      return res.ok;
    } catch {
      return false;
    }
  }, []);

  const loadFromServer = useCallback(async () => {
    if (!sessionId) return false;
    try {
      const res = await fetch(`${API_BASE}/resources?pageSize=100`, {
        headers: { "x-session-id": sessionId },
      });
      if (res.status === 401) {
        handleUnauthorized();
        return false;
      }
      if (!res.ok) {
        setIsOnline(false);
        return false;
      }
      const data = await res.json();
      setResources(data.data ?? []);
      setIsOnline(true);
      return true;
    } catch {
      setIsOnline(false);
      return false;
    }
  }, [sessionId]);

  const syncPending = useCallback(async () => {
    if (pendingQueue.current.length === 0) return;
    setIsSyncing(true);
    const queue = [...pendingQueue.current];
    pendingQueue.current = [];
    for (const op of queue) {
      try {
        if (op.type === "create") {
          const res = await fetch(`${API_BASE}/resources`, {
            method: "POST", headers: authHeaders(), body: JSON.stringify(op.data),
          });
          if (res.status === 401) { handleUnauthorized(); return; }
        } else if (op.type === "update") {
          const res = await fetch(`${API_BASE}/resources/${op.id}`, {
            method: "PUT", headers: authHeaders(), body: JSON.stringify(op.data),
          });
          if (res.status === 401) { handleUnauthorized(); return; }
        } else if (op.type === "delete") {
          const res = await fetch(`${API_BASE}/resources/${op.id}`, {
            method: "DELETE", headers: authHeaders(),
          });
          if (res.status === 401) { handleUnauthorized(); return; }
        }
      } catch {
        pendingQueue.current.push(op);
      }
    }
    await loadFromServer();
    setIsSyncing(false);
  }, [sessionId, loadFromServer]);

  useEffect(() => {
    if (!sessionId) return;
    loadFromServer();
    const interval = setInterval(async () => {
      const online = await checkOnline();
      if (online && !isOnline) {
        setIsOnline(true);
        await syncPending();
      } else if (!online && isOnline) {
        setIsOnline(false);
      }
    }, SYNC_INTERVAL);
    return () => clearInterval(interval);
  }, [sessionId, isOnline, checkOnline, loadFromServer, syncPending]);

  async function handleAdd(data) {
    const tempId = nextId;
    setResources(prev => [...prev, { ...data, id: tempId }]);
    setNextId(n => n + 1);
    if (isOnline && sessionId) {
      try {
        const res = await fetch(`${API_BASE}/resources`, {
          method: "POST", headers: authHeaders(), body: JSON.stringify(data),
        });
        if (res.status === 401) { handleUnauthorized(); return; }
        if (res.ok) {
          const created = await res.json();
          setResources(prev => prev.map(r => r.id === tempId ? created : r));
        }
      } catch {
        setIsOnline(false);
        pendingQueue.current.push({ type: "create", data });
      }
    } else {
      pendingQueue.current.push({ type: "create", data });
    }
  }

  async function handleUpdate(data) {
    setResources(prev => prev.map(r => r.id === data.id ? data : r));
    if (isOnline && sessionId) {
      try {
        const res = await fetch(`${API_BASE}/resources/${data.id}`, {
          method: "PUT", headers: authHeaders(), body: JSON.stringify(data),
        });
        if (res.status === 401) { handleUnauthorized(); return; }
      } catch {
        setIsOnline(false);
        pendingQueue.current.push({ type: "update", id: data.id, data });
      }
    } else {
      pendingQueue.current.push({ type: "update", id: data.id, data });
    }
  }

  async function handleDelete(id) {
    setResources(prev => prev.filter(r => r.id !== id));
    if (isOnline && sessionId) {
      try {
        const res = await fetch(`${API_BASE}/resources/${id}`, {
          method: "DELETE", headers: authHeaders(),
        });
        if (res.status === 401) { handleUnauthorized(); return; }
      } catch {
        setIsOnline(false);
        pendingQueue.current.push({ type: "delete", id });
      }
    } else {
      pendingQueue.current.push({ type: "delete", id });
    }
  }

  return {
    resources, isOnline, isSyncing,
    pendingCount: pendingQueue.current.length,
    handleAdd, handleUpdate, handleDelete,
    reload: loadFromServer,
  };
}
