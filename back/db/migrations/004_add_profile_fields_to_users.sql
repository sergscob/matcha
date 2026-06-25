ALTER TABLE users
    ADD COLUMN IF NOT EXISTS gender VARCHAR(10)
        CHECK (gender IN ('male', 'female')),

    ADD COLUMN IF NOT EXISTS sexual_orientation VARCHAR(20)
        CHECK (sexual_orientation IN ('heterosexual', 'homosexual', 'bisexual', NULL)),

    ADD COLUMN IF NOT EXISTS birth_date DATE,

    ADD COLUMN IF NOT EXISTS bio TEXT,

    ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION,

    ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION,

    ADD COLUMN IF NOT EXISTS location_label VARCHAR(255),

    ADD COLUMN IF NOT EXISTS location_source VARCHAR(10)
        CHECK (location_source IN ('gps', 'manual')),

    ADD COLUMN IF NOT EXISTS popularity_score INTEGER
        NOT NULL
        DEFAULT 0,

    ADD COLUMN IF NOT EXISTS last_seen TIMESTAMP;
