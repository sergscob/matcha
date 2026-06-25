ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_type_check;

ALTER TABLE notifications ADD CONSTRAINT notifications_type_check
    CHECK (type IN (
        'like', 'unlike', 'profile_view', 'message', 'match',
        'meetup_invite', 'meetup_accepted', 'meetup_declined', 'meetup_cancelled'
    ));
