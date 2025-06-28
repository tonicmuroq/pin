# pin

A simple Cloudflare Worker to pin phrases. Users can submit a sentence, click to increase its pin count, and view phrases sorted by popularity.

## Deployment

These steps assume you have [Node.js](https://nodejs.org/) and [wrangler](https://developers.cloudflare.com/workers/wrangler/) installed.

1. **Clone the repository**
   ```bash
   git clone <repo-url>
   cd pin
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create a D1 database**
   ```bash
   wrangler d1 create pin
   ```
   Update `wrangler.toml` with the generated `database_id`.

4. **Apply the schema**
   ```bash
   wrangler d1 execute pin --remote --file=./schema.sql
   ```

5. **Develop locally**
   ```bash
   npm start
   ```

6. **Deploy**
   ```bash
   wrangler deploy
   ```

After deployment, visit the Worker URL to use the app.
