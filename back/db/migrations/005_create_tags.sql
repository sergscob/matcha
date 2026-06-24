CREATE TABLE IF NOT EXISTS tags (
    id SERIAL PRIMARY KEY,

    name VARCHAR(30)
        UNIQUE NOT NULL
        CHECK (name ~ '^[a-z0-9_]+$')
);

CREATE TABLE IF NOT EXISTS user_tags (
    user_id INTEGER
        NOT NULL
        REFERENCES users(id)
        ON DELETE CASCADE,

    tag_id INTEGER
        NOT NULL
        REFERENCES tags(id)
        ON DELETE CASCADE,

    PRIMARY KEY (user_id, tag_id)
);
