CREATE TABLE IF NOT EXISTS profile_views (
    id SERIAL PRIMARY KEY,

    viewer_id INTEGER
        NOT NULL
        REFERENCES users(id)
        ON DELETE CASCADE,

    viewed_id INTEGER
        NOT NULL
        REFERENCES users(id)
        ON DELETE CASCADE,

    viewed_at TIMESTAMP
        DEFAULT NOW(),

    CHECK (viewer_id <> viewed_id)
);

CREATE INDEX IF NOT EXISTS profile_views_viewed_id_idx
    ON profile_views (viewed_id);

CREATE INDEX IF NOT EXISTS profile_views_viewer_id_idx
    ON profile_views (viewer_id);
