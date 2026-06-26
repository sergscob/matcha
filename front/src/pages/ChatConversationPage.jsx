import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { api } from "../api/client";
import { useAuth } from "../context/useAuth";
import { useSocket } from "../context/useSocket";
import { Spinner } from "../components/Spinner";

export function ChatConversationPage() {
    const { id } = useParams();
    const { user } = useAuth();
    const { socket, refreshCounts } = useSocket();
    const [messages, setMessages] = useState(null);
    const [body, setBody] = useState("");
    const [error, setError] = useState(null);
    const [sending, setSending] = useState(false);
    const bottomRef = useRef(null);
    const [chatProfile, setChatProfile] = useState(null);

    const load = useCallback(async () => {
        setError(null);

        try {
            //   const [msgs, profile] = await Promise.all([
            //     api.get(`/chat/${id}/messages`),
            //     api.get(`/chat/${id}/profile`)
            //   ]);
            //   setMessages(msgs);
            //   setChatProfile(profile);
            setMessages(await api.get(`/chat/${id}/messages`));
            setChatProfile(await api.get(`/discover/${id}`));
            await api.post(`/chat/${id}/read`);
            refreshCounts();
        } catch (err) {
            setError(err.message);
        }
    }, [id, refreshCounts]);

    useEffect(() => {
        load();
    }, [load]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ block: "nearest" });
    }, [messages]);

    useEffect(() => {
        if (!socket) return;

        function handleMessage(message) {
            const otherId = Number(id);
            if (message.senderId === otherId || message.recipientId === otherId) {
                load();
            }
        }

        socket.on("message:new", handleMessage);
        return () => socket.off("message:new", handleMessage);
    }, [socket, id, load]);

    async function handleSend(e) {
        e.preventDefault();
        if (!body.trim()) return;

        setSending(true);
        setError(null);

        try {
            await api.post(`/chat/${id}/messages`, { body });
            setBody("");
            await load();
        } catch (err) {
            setError(err.message);
        } finally {
            setSending(false);
        }
    }

    if (!messages && error) {
        return <p className="error">{error}</p>;
    }

    if (!messages) {
        return <p className="status">Loading conversation...</p>;
    }

    return (
        <div className="card chat-thread-card">
            <Link to="/chat" className="status">&larr; Back to messages</Link>

            {chatProfile && (
                <div className="chat-header" style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
                    <div>
                        <p>{chatProfile.firstName} {chatProfile.lastName}</p>
                    </div>
                </div>
            )}

            <div className="message-list">
                {messages.length === 0 && <p className="status">No messages yet. Say hello!</p>}

                {messages.map(m => (
                    <div key={m.id} className={`message-bubble${m.senderId === user.id ? " mine" : ""}`}>
                        <p>{m.body}</p>
                        <span className="notification-time">{new Date(m.createdAt).toLocaleString()}</span>
                    </div>
                ))}

                <div ref={bottomRef} />
            </div>

            {error && <p className="error">{error}</p>}

            <form className="message-composer" onSubmit={handleSend}>
                <input
                    type="text"
                    value={body}
                    onChange={e => setBody(e.target.value)}
                    placeholder="Type a message..."
                    maxLength={1024}
                    autoComplete="off"
                />
                <button type="submit" disabled={sending || !body.trim()}>
                    {sending && <Spinner />}
                    Send
                </button>
            </form>
        </div>
    );
}
