export interface Env {
  DB: D1Database;
}

async function renderList(env: Env): Promise<string> {
  const { results } = await env.DB.prepare(
    "SELECT id, phrase, count FROM pins ORDER BY count DESC",
  ).all();
  const items = results as { id: number; phrase: string; count: number }[];
  return items
    .map(
      (item) => `<li class="my-2">
        <a class="block p-4 bg-gray-100 rounded pin-link" href="/pin/${item.id}" data-id="${item.id}">
          ${item.phrase} <span class="text-sm text-gray-500">(${item.count})</span>
        </a>
      </li>`,
    )
    .join("");
}

async function renderPage(env: Env): Promise<Response> {
  const list = await renderList(env);
  const body = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>pin</title>
<link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
</head>
<body class="bg-gray-50 min-h-screen flex items-center justify-center">
<div class="w-full max-w-md p-4">
<h1 class="text-2xl font-bold mb-4 text-center">pin</h1>
<form method="POST" action="/pin" class="mb-4 flex">
<input type="text" name="phrase" required class="flex-grow p-2 border rounded-l" placeholder="Say something" />
<button type="submit" class="px-4 bg-blue-500 text-white rounded-r">Pin</button>
</form>
<ul>${list}</ul>
</div>
<script>
function randomSubtleGradient() {
  const gradients = [
    'linear-gradient(90deg, #659999, #7a8d89, #f4791f)',
    'linear-gradient(90deg, #22c1c3, #fdbb2d)',
    'linear-gradient(90deg, #a1c4fd, #c2e9fb)',
    'linear-gradient(90deg, #e0c3fc, #8ec5fc)',
    'linear-gradient(90deg, #e6e9f0, #eef1f5)'
  ];
  return gradients[Math.floor(Math.random() * gradients.length)];
}
document.body.style.background = randomSubtleGradient();
const btn = document.querySelector("form button[type='submit']");
if (btn) btn.style.background = randomSubtleGradient();
document.addEventListener('click', async (e) => {
  const target = e.target;
  if (!(target instanceof Element)) return;
  const link = target.closest('.pin-link');
  if (link instanceof HTMLAnchorElement) {
    e.preventDefault();
    await fetch(link.getAttribute('href') || '', { method: 'POST' });
    location.reload();
  }
});
</script>
</body>
</html>`;
  return new Response(body, {
    headers: { "Content-Type": "text/html; charset=UTF-8" },
  });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (request.method === "POST" && url.pathname === "/pin") {
      const form = await request.formData();
      const phrase = form.get("phrase");
      if (typeof phrase === "string" && phrase.trim()) {
        await env.DB.prepare("INSERT INTO pins (phrase, count) VALUES (?, 1)")
          .bind(phrase.trim())
          .run();
      }
      return Response.redirect(url.origin, 303);
    }

    const match = url.pathname.match(/^\/pin\/(\d+)$/);
    if (request.method === "POST" && match) {
      const id = Number(match[1]);
      await env.DB.prepare("UPDATE pins SET count = count + 1 WHERE id = ?")
        .bind(id)
        .run();
      return Response.redirect(url.origin, 303);
    }

    return renderPage(env);
  },
};
