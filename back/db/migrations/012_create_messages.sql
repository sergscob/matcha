CREATE TABLE IF NOT EXISTS messages (
    id SERIAL PRIMARY KEY,

    sender_id INTEGER
        NOT NULL
        REFERENCES users(id)
        ON DELETE CASCADE,

    recipient_id INTEGER
        NOT NULL
        REFERENCES users(id)
        ON DELETE CASCADE,

    body TEXT NOT NULL,

    read_at TIMESTAMP,

    created_at TIMESTAMP
        NOT NULL
        DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS messages_conversation_idx
    ON messages (LEAST(sender_id, recipient_id), GREATEST(sender_id, recipient_id), created_at);

CREATE INDEX IF NOT EXISTS messages_unread_idx
    ON messages (recipient_id, read_at);
