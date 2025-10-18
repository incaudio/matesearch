-- Seed default user for library functionality
INSERT OR IGNORE INTO users (id, email, first_name, last_name, profile_image_url, created_at, updated_at)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'default@mate-music.app',
  'Default',
  'User',
  NULL,
  unixepoch(),
  unixepoch()
);
