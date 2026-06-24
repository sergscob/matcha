ALTER TABLE users
    ADD COLUMN gender VARCHAR(10)
        CHECK (gender IN ('male', 'female')),

    ADD COLUMN sexual_orientation VARCHAR(20)
        NOT NULL
        DEFAULT 'bisexual'
        CHECK (sexual_orientation IN ('heterosexual', 'homosexual', 'bisexual')),

    ADD COLUMN birth_date DATE,

    ADD COLUMN bio TEXT,

    ADD COLUMN latitude DOUBLE PRECISION,

    ADD COLUMN longitude DOUBLE PRECISION,

    ADD COLUMN location_label VARCHAR(255),

    ADD COLUMN location_source VARCHAR(10)
        CHECK (location_source IN ('gps', 'manual')),

    ADD COLUMN popularity_score INTEGER
        NOT NULL
        DEFAULT 0,

    ADD COLUMN last_seen TIMESTAMP;
