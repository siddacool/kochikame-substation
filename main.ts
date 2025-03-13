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

  console.log(files);

  ctx.response.body = `<!DOCTYPE html>
    <html>
      <head><title>Hello oak!</title><head>
      <body>
        <h1>Hello oak!</h1>
        <ul>
         ${
    files.map((file) =>
      `<li><a href="/public/subtitles/${file}" download>${file}</a></li>`
    )
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
