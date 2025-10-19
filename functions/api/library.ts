import { Hono } from 'hono';
import { drizzle } from 'drizzle-orm/d1';
import { eq, and, desc } from 'drizzle-orm';
import * as schema from '../../server/db/schema.d1';

type Env = {
  DB: D1Database;
};

const app = new Hono<{ Bindings: Env }>();

const DEFAULT_USER_ID = "00000000-0000-0000-0000-000000000001";

app.get("/api/playlists", async (c) => {
  try {
    const db = drizzle(c.env.DB, { schema });
    
    const playlists = await db.query.playlists.findMany({
      where: eq(schema.playlists.userId, DEFAULT_USER_ID),
      orderBy: [desc(schema.playlists.updatedAt)],
    });

    return c.json(playlists);
  } catch (error: any) {
    console.error("Error fetching playlists:", error);
    return c.json({ error: error.message || "Failed to fetch playlists" }, 500);
  }
});

app.post("/api/playlists", async (c) => {
  try {
    const db = drizzle(c.env.DB, { schema });
    const { name, description } = await c.req.json();

    if (!name || typeof name !== 'string' || name.length < 1 || name.length > 100) {
      return c.json({ error: "Invalid playlist name" }, 400);
    }

    const [playlist] = await db.insert(schema.playlists).values({
      userId: DEFAULT_USER_ID,
      name,
      description: description || null,
    }).returning();

    return c.json(playlist);
  } catch (error: any) {
    console.error("Error creating playlist:", error);
    return c.json({ error: error.message || "Failed to create playlist" }, 500);
  }
});

app.patch("/api/playlists/:id", async (c) => {
  try {
    const db = drizzle(c.env.DB, { schema });
    const id = c.req.param('id');
    const { name, description } = await c.req.json();

    const updateData: any = {};
    if (name) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    updateData.updatedAt = Math.floor(Date.now() / 1000);

    const [playlist] = await db.update(schema.playlists)
      .set(updateData)
      .where(and(
        eq(schema.playlists.id, id),
        eq(schema.playlists.userId, DEFAULT_USER_ID)
      ))
      .returning();

    if (!playlist) {
      return c.json({ error: "Playlist not found" }, 404);
    }

    return c.json(playlist);
  } catch (error: any) {
    console.error("Error updating playlist:", error);
    return c.json({ error: error.message || "Failed to update playlist" }, 500);
  }
});

app.delete("/api/playlists/:id", async (c) => {
  try {
    const db = drizzle(c.env.DB, { schema });
    const id = c.req.param('id');

    await db.delete(schema.playlists)
      .where(and(
        eq(schema.playlists.id, id),
        eq(schema.playlists.userId, DEFAULT_USER_ID)
      ));

    return c.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting playlist:", error);
    return c.json({ error: error.message || "Failed to delete playlist" }, 500);
  }
});

app.get("/api/playlists/:id/songs", async (c) => {
  try {
    const db = drizzle(c.env.DB, { schema });
    const id = c.req.param('id');

    const songs = await db.query.playlistSongs.findMany({
      where: eq(schema.playlistSongs.playlistId, id),
      with: {
        song: true,
      },
      orderBy: [schema.playlistSongs.position],
    });

    return c.json(songs.map(ps => ps.song));
  } catch (error: any) {
    console.error("Error fetching playlist songs:", error);
    return c.json({ error: error.message || "Failed to fetch playlist songs" }, 500);
  }
});

app.post("/api/playlists/:id/songs", async (c) => {
  try {
    const db = drizzle(c.env.DB, { schema });
    const id = c.req.param('id');
    const songData = await c.req.json();

    const existingSong = await db.query.songs.findFirst({
      where: eq(schema.songs.id, songData.id),
    });

    if (!existingSong) {
      await db.insert(schema.songs).values(songData);
    }

    const existingPlaylistSong = await db.query.playlistSongs.findFirst({
      where: and(
        eq(schema.playlistSongs.playlistId, id),
        eq(schema.playlistSongs.songId, songData.id)
      ),
    });

    if (existingPlaylistSong) {
      return c.json({ error: "Song already in playlist" }, 409);
    }

    const maxPosition = await db.query.playlistSongs.findFirst({
      where: eq(schema.playlistSongs.playlistId, id),
      orderBy: [desc(schema.playlistSongs.position)],
    });

    await db.insert(schema.playlistSongs).values({
      playlistId: id,
      songId: songData.id,
      position: (maxPosition?.position || 0) + 1,
    });

    return c.json({ success: true });
  } catch (error: any) {
    console.error("Error adding song to playlist:", error);
    return c.json({ error: error.message || "Failed to add song to playlist" }, 500);
  }
});

app.delete("/api/playlists/:playlistId/songs/:songId", async (c) => {
  try {
    const db = drizzle(c.env.DB, { schema });
    const playlistId = c.req.param('playlistId');
    const songId = c.req.param('songId');

    await db.delete(schema.playlistSongs)
      .where(and(
        eq(schema.playlistSongs.playlistId, playlistId),
        eq(schema.playlistSongs.songId, songId)
      ));

    return c.json({ success: true });
  } catch (error: any) {
    console.error("Error removing song from playlist:", error);
    return c.json({ error: error.message || "Failed to remove song from playlist" }, 500);
  }
});

app.get("/api/liked-songs", async (c) => {
  try {
    const db = drizzle(c.env.DB, { schema });
    
    const likedSongs = await db.query.likedSongs.findMany({
      where: eq(schema.likedSongs.userId, DEFAULT_USER_ID),
      with: {
        song: true,
      },
      orderBy: [desc(schema.likedSongs.likedAt)],
    });

    return c.json(likedSongs.map(ls => ls.song));
  } catch (error: any) {
    console.error("Error fetching liked songs:", error);
    return c.json({ error: error.message || "Failed to fetch liked songs" }, 500);
  }
});

app.post("/api/liked-songs", async (c) => {
  try {
    const db = drizzle(c.env.DB, { schema });
    const songData = await c.req.json();

    const existingSong = await db.query.songs.findFirst({
      where: eq(schema.songs.id, songData.id),
    });

    if (!existingSong) {
      await db.insert(schema.songs).values(songData);
    }

    const existingLike = await db.query.likedSongs.findFirst({
      where: and(
        eq(schema.likedSongs.userId, DEFAULT_USER_ID),
        eq(schema.likedSongs.songId, songData.id)
      ),
    });

    if (existingLike) {
      return c.json({ error: "Song already liked" }, 409);
    }

    await db.insert(schema.likedSongs).values({
      userId: DEFAULT_USER_ID,
      songId: songData.id,
    });

    return c.json({ success: true });
  } catch (error: any) {
    console.error("Error liking song:", error);
    return c.json({ error: error.message || "Failed to like song" }, 500);
  }
});

app.delete("/api/liked-songs/:songId", async (c) => {
  try {
    const db = drizzle(c.env.DB, { schema });
    const songId = c.req.param('songId');

    await db.delete(schema.likedSongs)
      .where(and(
        eq(schema.likedSongs.userId, DEFAULT_USER_ID),
        eq(schema.likedSongs.songId, songId)
      ));

    return c.json({ success: true });
  } catch (error: any) {
    console.error("Error unliking song:", error);
    return c.json({ error: error.message || "Failed to unlike song" }, 500);
  }
});

app.get("/api/saved-songs", async (c) => {
  try {
    const db = drizzle(c.env.DB, { schema });
    
    const savedSongs = await db.query.savedSongs.findMany({
      where: eq(schema.savedSongs.userId, DEFAULT_USER_ID),
      with: {
        song: true,
      },
      orderBy: [desc(schema.savedSongs.savedAt)],
    });

    return c.json(savedSongs.map(ss => ss.song));
  } catch (error: any) {
    console.error("Error fetching saved songs:", error);
    return c.json({ error: error.message || "Failed to fetch saved songs" }, 500);
  }
});

app.post("/api/saved-songs", async (c) => {
  try {
    const db = drizzle(c.env.DB, { schema });
    const songData = await c.req.json();

    const existingSong = await db.query.songs.findFirst({
      where: eq(schema.songs.id, songData.id),
    });

    if (!existingSong) {
      await db.insert(schema.songs).values(songData);
    }

    const existingSave = await db.query.savedSongs.findFirst({
      where: and(
        eq(schema.savedSongs.userId, DEFAULT_USER_ID),
        eq(schema.savedSongs.songId, songData.id)
      ),
    });

    if (existingSave) {
      return c.json({ error: "Song already saved" }, 409);
    }

    await db.insert(schema.savedSongs).values({
      userId: DEFAULT_USER_ID,
      songId: songData.id,
    });

    return c.json({ success: true });
  } catch (error: any) {
    console.error("Error saving song:", error);
    return c.json({ error: error.message || "Failed to save song" }, 500);
  }
});

app.delete("/api/saved-songs/:songId", async (c) => {
  try {
    const db = drizzle(c.env.DB, { schema });
    const songId = c.req.param('songId');

    await db.delete(schema.savedSongs)
      .where(and(
        eq(schema.savedSongs.userId, DEFAULT_USER_ID),
        eq(schema.savedSongs.songId, songId)
      ));

    return c.json({ success: true });
  } catch (error: any) {
    console.error("Error unsaving song:", error);
    return c.json({ error: error.message || "Failed to unsave song" }, 500);
  }
});

export const onRequest = app.fetch;
