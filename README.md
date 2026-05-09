# GameWikiHub Home

Landing site for **gamewikihub.com** — the apex domain of the GameWikiHub
network. Each game wiki lives on its own subdomain (e.g.
`mewgenics.gamewikihub.com`); this site is the directory that links them.

## Structure

```
.
├── index.html             Home — hero + games grid
├── about.html             About the project
├── privacy-policy.html    Privacy policy (AdSense-friendly)
├── contact.html           Contact + suggestions
├── css/
│   └── style.css          Shared dark theme stylesheet
├── robots.txt
├── sitemap.xml
└── README.md
```

Pure static HTML/CSS — no build step, no dependencies.

## Deploying to Cloudflare Pages

1. Push this folder as the root of a new GitHub repo (e.g. `gamewikihub-home`).
2. Cloudflare dashboard → **Workers & Pages** → **Create application** →
   **Pages** → **Connect to Git** → pick the repo.
3. Build settings: **Framework preset = None**, **Build command = (empty)**,
   **Build output directory = `/`** (or leave blank).
4. After the first deploy, **Custom domains** → add `gamewikihub.com`
   (and optionally `www.gamewikihub.com`).
5. Cloudflare will create the DNS records automatically if the zone is on
   Cloudflare DNS. Wait for SSL to provision (a minute or two).

## Adding a new game wiki

In `index.html`, find the `.games` section and copy the existing Mewgenics
`.game-card` block. Update:

- `href` — the subdomain URL (e.g. `https://newgame.gamewikihub.com/`)
- `.icon` — an emoji or short symbol
- `<h3>` — the game name
- `.desc` — one or two sentences about the game and what the wiki covers
- `.tag` chips — genre / platform / status

When you have multiple real cards, you can delete the `.game-card.coming`
placeholder.

Also add the new URL to `sitemap.xml` if you want it indexed at the hub level.

## Google AdSense

Each page includes the AdSense loader in `<head>`:

```html
<script async
  src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1319817671788428"
  crossorigin="anonymous"></script>
```

This is what AdSense's verification crawler looks for. Once `gamewikihub.com`
is live with this snippet, you can finish the "Connect your site" step in
AdSense.

If verification still fails after deploy:

- Confirm the snippet is in the **served** HTML:
  `curl -A "Mediapartners-Google" https://gamewikihub.com/ | grep adsbygoogle`
- Cloudflare → Security → Bots → turn **Bot Fight Mode OFF**.
- Cloudflare → SSL/TLS → set to **Full** (not Flexible).
- Purge Cloudflare cache after deploys.

## License / notice

GameWikiHub is an unofficial fan project. All game names, characters, and
trademarks are property of their respective owners. Site code is yours to
modify; game content references on individual wikis are used for
informational purposes only.
