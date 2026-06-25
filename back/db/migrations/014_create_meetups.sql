CREATE TABLE IF NOT EXISTS meetups (
    id SERIAL PRIMARY KEY,

    proposer_id INTEGER
        NOT NULL
        REFERENCES users(id)
        ON DELETE CASCADE,

    invitee_id INTEGER
        NOT NULL
        REFERENCES users(id)
        ON DELETE CASCADE,

    location_label VARCHAR(255) NOT NULL,

    scheduled_at TIMESTAMP NOT NULL,

    status VARCHAR(20)
        NOT NULL
        DEFAULT 'pending'
        CHECK (status IN ('pending', 'accepted', 'declined', 'cancelled')),

    created_at TIMESTAMP
        NOT NULL
        DEFAULT NOW(),

    CHECK (proposer_id <> invitee_id)
);

CREATE INDEX IF NOT EXISTS meetups_invitee_idx ON meetups (invitee_id, status);
CREATE INDEX IF NOT EXISTS meetups_proposer_idx ON meetups (proposer_id, status);
