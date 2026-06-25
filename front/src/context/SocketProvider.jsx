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

    // защита от React StrictMode в dev: эффекты в dev маунтятся как mount→cleanup→mount синхронно. 
    // Если бы cleanup сразу звал socket.disconnect(), второй mount открывал бы НОВЫЙ сокет, 
    // пока первый ещё не завершил отключение — в консоли вылетает "WebSocket closed before connection established". 
    // Поэтому disconnect откладывается на setTimeout(..., 0); если remount произошёл синхронно (StrictMode), 
    // clearTimeout его гасит, и переиспользуется тот же сокет — реальный disconnect происходит 
    // при настоящем размонтировании (логаут/закрытие таба).
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
