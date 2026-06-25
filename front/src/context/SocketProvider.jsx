import { useCallback, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

import { api } from "../api/client";
import { useAuth } from "./useAuth";
import { SocketContext } from "./socket-context";

const API_URL = import.meta.env.VITE_API_URL;

export function SocketProvider({ children }) {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const socketRef = useRef(null);
  const pendingDisconnectRef = useRef(null);

  const refreshCounts = useCallback(async () => {
    const [{ count }, conversations] = await Promise.all([
      api.get("/notifications/unread-count"),
      api.get("/chat/conversations")
    ]);

    setUnreadNotifications(count);
    setUnreadMessages(conversations.reduce((sum, c) => sum + c.unreadCount, 0));
  }, []);

  useEffect(() => {
    if (!user) {
      setSocket(null);
      setUnreadNotifications(0);
      setUnreadMessages(0);
      return;
    }

    // StrictMode's dev-only mount->cleanup->remount happens synchronously,
    // before this deferred disconnect's timer ever fires, so it cancels out
    // and reuses the same socket instead of opening a second connection and
    // immediately tearing down the first mid-handshake (which otherwise logs
    // a native "WebSocket closed before connection established" warning).
    if (pendingDisconnectRef.current) {
      clearTimeout(pendingDisconnectRef.current);
      pendingDisconnectRef.current = null;
    } else {
      socketRef.current = io(API_URL || undefined, { withCredentials: true });
      setSocket(socketRef.current);
    }

    return () => {
      pendingDisconnectRef.current = setTimeout(() => {
        socketRef.current?.disconnect();
        socketRef.current = null;
        pendingDisconnectRef.current = null;
      }, 0);
    };
  }, [user]);

  useEffect(() => {
    if (!socket) return;

    // also fires on reconnect, which resyncs counts in case events were
    // missed while disconnected
    socket.on("connect", refreshCounts);
    socket.on("notification:new", () => setUnreadNotifications(c => c + 1));
    socket.on("message:new", refreshCounts);

    return () => {
      socket.off("connect", refreshCounts);
      socket.off("notification:new");
      socket.off("message:new", refreshCounts);
    };
  }, [socket, refreshCounts]);

  return (
    <SocketContext.Provider value={{ socket, unreadNotifications, unreadMessages, refreshCounts }}>
      {children}
    </SocketContext.Provider>
  );
}
