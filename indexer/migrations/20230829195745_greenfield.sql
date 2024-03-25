-- +goose Up
-- +goose StatementBegin
SELECT 'up SQL query';
-- +goose StatementEnd
ALTER TABLE token_metadata ADD COLUMN is_backed_on_greenfield BOOLEAN NOT NULL DEFAULT FALSE;
-- +goose Down
-- +goose StatementBegin
SELECT 'down SQL query';
-- +goose StatementEnd
ALTER TABLE token_metadata DROP COLUMN is_backed_on_greenfield;
