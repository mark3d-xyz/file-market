-- +goose Up
-- +goose StatementBegin
SELECT 'up SQL query';
-- +goose StatementEnd
ALTER TABLE public.user_profiles
    ADD COLUMN instagram TEXT UNIQUE;

-- +goose Down
-- +goose StatementBegin
SELECT 'down SQL query';
-- +goose StatementEnd
ALTER TABLE public.user_profiles
    DROP COLUMN instagram;

