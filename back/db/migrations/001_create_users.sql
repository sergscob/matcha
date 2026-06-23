CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,

    email VARCHAR(255)
        UNIQUE NOT NULL,

    username VARCHAR(50)
        UNIQUE NOT NULL,

    first_name VARCHAR(100)
        NOT NULL,

    last_name VARCHAR(100)
        NOT NULL,

    password_hash TEXT
        NOT NULL,

    verified BOOLEAN
        DEFAULT FALSE,

    created_at TIMESTAMP
        DEFAULT NOW()
);