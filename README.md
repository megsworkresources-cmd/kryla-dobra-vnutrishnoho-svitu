# Kryla Dobra Vnutrishnoho Svitu

Implement exactly the screenshot and nothing else

This project was built with [Lovable](https://lovable.dev).

## Production

Production is deployed on Vercel: **https://kryla-dobra-vnutrishnoho-svitu.vercel.app**

Vercel builds from the repository using `vercel.json`; pushing to `main` deploys the app. The Lovable editor is optional and its sync is independent of the live Vercel site.

Check the live page and all 18 recorded films after a deploy:

```sh
bun run verify:deploy
```

Vercel does not expose the `data-commit-sha` marker, so the check skips the commit comparison unless `--expect <sha>` is passed. Caregiver sign-in redirects use the current origin, so add **https://kryla-dobra-vnutrishnoho-svitu.vercel.app** to Supabase Auth → URL Configuration (Site URL and Redirect URLs).

A custom domain is not connected yet; when one is added in Vercel → Project → Settings → Domains, also add it to Supabase Auth → URL Configuration and update the canonical host.

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/83788524-c3a7-44e7-8dfd-a1c09853ba2e).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Install [Bun](https://bun.sh/docs/installation), then run:

```sh
bun install --frozen-lockfile
bun run dev
```

## Validation

```sh
bun run build
bun run lint
bun run test
bun run verify:deploy
```
