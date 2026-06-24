CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,

    user_id INTEGER
        NOT NULL
        REFERENCES users(id)
        ON DELETE CASCADE,

    actor_id INTEGER
        REFERENCES users(id)
        ON DELETE CASCADE,

    type VARCHAR(20)
        NOT NULL
        CHECK (type IN ('like', 'unlike', 'profile_view', 'message', 'match')),

    is_read BOOLEAN
        NOT NULL
        DEFAULT FALSE,

    created_at TIMESTAMP
        DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS notifications_user_id_is_read_idx
    ON notifications (user_id, is_read);
