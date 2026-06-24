CREATE TABLE IF NOT EXISTS fake_reports (
    id SERIAL PRIMARY KEY,

    reporter_id INTEGER
        NOT NULL
        REFERENCES users(id)
        ON DELETE CASCADE,

    reported_id INTEGER
        NOT NULL
        REFERENCES users(id)
        ON DELETE CASCADE,

    created_at TIMESTAMP
        DEFAULT NOW(),

    UNIQUE (reporter_id, reported_id),

    CHECK (reporter_id <> reported_id)
);
