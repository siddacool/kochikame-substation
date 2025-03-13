import { Application } from 'jsr:@oak/oak/application';
import { Router } from 'jsr:@oak/oak/router';
import { send } from 'jsr:@oak/oak/send';

export async function getSubs(path: string) {
  try {
    const subs = [];

    for await (const dirEntry of Deno.readDir(path)) {
      if (!dirEntry.isFile) {
        continue;
      }

      subs.push(dirEntry.name);
    }

    return Promise.resolve(subs);
  } catch (e) {
    console.error(e);

    return Promise.resolve([]);
  }
}

const router = new Router();
router.get('/', async (ctx) => {
  const files = await getSubs('./public/subtitles');

  ctx.response.body = `<!DOCTYPE html>
    <html>
      <head><title>Kochikame Substation</title><head>
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
      <link href="https://fonts.googleapis.com/css2?family=Nunito+Sans:ital,opsz,wdth,wght@0,6..12,75..125,200..1000;1,6..12,75..125,200..1000&display=swap" rel="stylesheet">
      <body>
        <style>
         * {
           box-sizing: border-box;
        }

          body {
            font-family: "Nunito Sans", sans-serif;
            font-size: 16px:
          }

          li {
           margin-bottom: 8px;
          }
        </style>
        <h1>Kochikame Substation</h1>
        <p>Kochikame eng subtitles (AI generated)</p>
        <ul>
         ${
    files.map((file) =>
      `<li><a href="/public/subtitles/${file}" download>${file}</a></li>`
    ).join('')
  }
        </ul>
      </body>
    </html>
  `;
});

const app = new Application();

// Serve static files from the "public" folder
app.use(async (ctx, next) => {
  if (ctx.request.url.pathname.startsWith('/public')) {
    await send(ctx, ctx.request.url.pathname, {
      root: `${Deno.cwd()}`,
    });
  } else {
    await next();
  }
});

app.use(router.routes());
app.use(router.allowedMethods());

app.listen({ port: 8080 });
