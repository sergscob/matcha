CREATE TABLE IF NOT EXISTS photos (
    id SERIAL PRIMARY KEY,

    user_id INTEGER
        NOT NULL
        REFERENCES users(id)
        ON DELETE CASCADE,

    file_name TEXT
        NOT NULL,

    is_profile BOOLEAN
        NOT NULL
        DEFAULT FALSE,

    position SMALLINT
        NOT NULL
        DEFAULT 0,

    created_at TIMESTAMP
        DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS one_profile_photo_per_user
    ON photos (user_id)
    WHERE is_profile;
