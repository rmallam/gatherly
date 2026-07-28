-- Passwordless auth: OTP codes keyed by a generic identifier (email or phone),
-- with a hashed code and an attempts counter to resist brute force.
CREATE TABLE IF NOT EXISTS auth_otp_codes (
    identifier   VARCHAR(255) PRIMARY KEY,
    code_hash    VARCHAR(64)  NOT NULL,
    channel      VARCHAR(10)  NOT NULL DEFAULT 'email',
    attempts     INTEGER      NOT NULL DEFAULT 0,
    expires_at   TIMESTAMP    NOT NULL,
    created_at   TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);
