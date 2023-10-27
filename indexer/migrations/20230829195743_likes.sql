-- +goose Up
-- +goose StatementBegin
SELECT 'up SQL query';
-- +goose StatementEnd
ALTER TABLE public.tokens
 ADD COLUMN like_count BIGINT NOT NULL DEFAULT 0;

-- +goose Down
-- +goose StatementBegin
SELECT 'down SQL query';
-- +goose StatementEnd
ALTER TABLE public.tokens
    DROP COLUMN like_count;