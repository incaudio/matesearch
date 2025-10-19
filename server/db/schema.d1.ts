import { sqliteTable, text, integer, primaryKey, index } from "drizzle-orm/sqlite-core";
import { relations, sql } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  email: text("email").unique(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  profileImageUrl: text("profile_image_url"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
});

export const insertUserSchema = createInsertSchema(users);
export const selectUserSchema = createSelectSchema(users);

export const songs = sqliteTable("songs", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  artist: text("artist").notNull(),
  thumbnail: text("thumbnail").notNull(),
  duration: text("duration"),
  platform: text("platform").notNull(),
  url: text("url").notNull(),
  embedUrl: text("embed_url"),
  publishedAt: text("published_at"),
  viewCount: integer("view_count"),
  description: text("description"),
  metadata: text("metadata", { mode: "json" }),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
});

export const insertSongSchema = createInsertSchema(songs);
export const selectSongSchema = createSelectSchema(songs);

export const playlists = sqliteTable("playlists", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  name: text("name").notNull(),
  description: text("description"),
  thumbnail: text("thumbnail"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
});

export const insertPlaylistSchema = createInsertSchema(playlists);
export const selectPlaylistSchema = createSelectSchema(playlists);

export const playlistSongs = sqliteTable("playlist_songs", {
  playlistId: text("playlist_id").references(() => playlists.id, { onDelete: "cascade" }).notNull(),
  songId: text("song_id").references(() => songs.id, { onDelete: "cascade" }).notNull(),
  position: integer("position").notNull().default(0),
  addedAt: integer("added_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
}, (table) => ({
  pk: primaryKey({ columns: [table.playlistId, table.songId] }),
}));

export const insertPlaylistSongSchema = createInsertSchema(playlistSongs);
export const selectPlaylistSongSchema = createSelectSchema(playlistSongs);

export const likedSongs = sqliteTable("liked_songs", {
  userId: text("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  songId: text("song_id").references(() => songs.id, { onDelete: "cascade" }).notNull(),
  likedAt: integer("liked_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
}, (table) => ({
  pk: primaryKey({ columns: [table.userId, table.songId] }),
}));

export const insertLikedSongSchema = createInsertSchema(likedSongs);
export const selectLikedSongSchema = createSelectSchema(likedSongs);

export const savedSongs = sqliteTable("saved_songs", {
  userId: text("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  songId: text("song_id").references(() => songs.id, { onDelete: "cascade" }).notNull(),
  savedAt: integer("saved_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
}, (table) => ({
  pk: primaryKey({ columns: [table.userId, table.songId] }),
}));

export const insertSavedSongSchema = createInsertSchema(savedSongs);
export const selectSavedSongSchema = createSelectSchema(savedSongs);

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Song = typeof songs.$inferSelect;
export type InsertSong = typeof songs.$inferInsert;
export type Playlist = typeof playlists.$inferSelect;
export type InsertPlaylist = typeof playlists.$inferInsert;
export type PlaylistSong = typeof playlistSongs.$inferSelect;
export type InsertPlaylistSong = typeof playlistSongs.$inferInsert;
export type LikedSong = typeof likedSongs.$inferSelect;
export type InsertLikedSong = typeof likedSongs.$inferInsert;
export type SavedSong = typeof savedSongs.$inferSelect;
export type InsertSavedSong = typeof savedSongs.$inferInsert;

export const usersRelations = relations(users, ({ many }) => ({
  playlists: many(playlists),
  likedSongs: many(likedSongs),
  savedSongs: many(savedSongs),
}));

export const playlistsRelations = relations(playlists, ({ one, many }) => ({
  user: one(users, {
    fields: [playlists.userId],
    references: [users.id],
  }),
  playlistSongs: many(playlistSongs),
}));

export const songsRelations = relations(songs, ({ many }) => ({
  playlistSongs: many(playlistSongs),
  likedBy: many(likedSongs),
  savedBy: many(savedSongs),
}));

export const playlistSongsRelations = relations(playlistSongs, ({ one }) => ({
  playlist: one(playlists, {
    fields: [playlistSongs.playlistId],
    references: [playlists.id],
  }),
  song: one(songs, {
    fields: [playlistSongs.songId],
    references: [songs.id],
  }),
}));

export const likedSongsRelations = relations(likedSongs, ({ one }) => ({
  user: one(users, {
    fields: [likedSongs.userId],
    references: [users.id],
  }),
  song: one(songs, {
    fields: [likedSongs.songId],
    references: [songs.id],
  }),
}));

export const savedSongsRelations = relations(savedSongs, ({ one }) => ({
  user: one(users, {
    fields: [savedSongs.userId],
    references: [users.id],
  }),
  song: one(songs, {
    fields: [savedSongs.songId],
    references: [songs.id],
  }),
}));
