CREATE TABLE IF NOT EXISTS password_resets (
    id SERIAL PRIMARY KEY,

    user_id INTEGER
        NOT NULL
        REFERENCES users(id)
        ON DELETE CASCADE,

    token TEXT
        UNIQUE NOT NULL,

    expires_at TIMESTAMP
        NOT NULL,

    used BOOLEAN
        DEFAULT FALSE,

    created_at TIMESTAMP
        DEFAULT NOW()
);
