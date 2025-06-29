export interface Env {
  DB: D1Database;
}

async function listPins(env: Env): Promise<Response> {
  const { results } = await env.DB.prepare(
    'SELECT id, phrase, emoji, count FROM pins ORDER BY count DESC'
  ).all();
  return Response.json(results);
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (request.method === 'GET' && url.pathname === '/api/pins') {
      return listPins(env);
    }

    if (request.method === 'POST' && url.pathname === '/api/pin') {
      const form = await request.formData();
      const phrase = form.get('phrase');
      const emoji = form.get('emoji');
      if (typeof phrase === 'string' && phrase.trim()) {
        await env.DB.prepare(
          'INSERT INTO pins (phrase, emoji, count) VALUES (?, ?, 1)'
        )
          .bind(phrase.trim(), typeof emoji === 'string' ? emoji : null)
          .run();
      }
      return new Response(null, { status: 201 });
    }

    const match = url.pathname.match(/^\/api\/pin\/(\d+)$/);
    if (request.method === 'POST' && match) {
      const id = Number(match[1]);
      await env.DB.prepare('UPDATE pins SET count = count + 1 WHERE id = ?')
        .bind(id)
        .run();
      return new Response(null, { status: 204 });
    }

    return new Response('Not Found', { status: 404 });
  },
};
