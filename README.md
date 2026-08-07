# HUBIC

Static marketing site (`index.html`, `advisory.html`) plus a Vercel serverless
function for the enquiry form (`api/enquiry.js`).

Google Analytics is injected at build time: `index.html` / `advisory.html`
ship with a `__GA_MEASUREMENT_ID__` placeholder in the `gtag.js` script tag,
and `build.js` substitutes it from the `GA_MEASUREMENT_ID` env var, writing
the result to `dist/`. This keeps the measurement ID out of source and lets
Production/Preview/local builds each use a different GA property.

## Commands

Install dependencies:

```
npm install
```

Build (substitutes `GA_MEASUREMENT_ID` into `dist/index.html` and
`dist/advisory.html`):

```
npm run build
```

Run locally after building:

```
npx serve dist
# or
python3 -m http.server 8080 --directory dist
```

`api/enquiry.js` won't run under a plain static server — it's a Vercel
serverless function. To test it locally with Vercel's dev server (serves
`dist/` and `api/` together, using `.env`/`.env.local` for env vars):

```
npx vercel dev
```

## Environment variables (Vercel)

Set these in the Vercel project settings (Production/Preview/Development as
needed), or in a local `.env` / `.env.local` file (already gitignored) for
`vercel dev`:

| Variable            | Used by            | Required | Notes                                                                 |
|---------------------|---------------------|----------|------------------------------------------------------------------------|
| `GA_MEASUREMENT_ID` | `build.js`          | No       | Google Analytics measurement ID (e.g. `G-XXXXXXXXXX`). If unset, the build ships with GA disabled. |
| `SMTP_LOGIN`        | `api/enquiry.js`    | Yes      | Gmail SMTP username used to send enquiry emails.                       |
| `SMTP_PASSWORD`     | `api/enquiry.js`    | Yes      | Gmail SMTP app password.                                               |
| `TO_EMAIL`          | `api/enquiry.js`    | No       | Recipient for enquiry emails. Defaults to `nathan@infomoksha.com`.     |
| `FROM_EMAIL`        | `api/enquiry.js`    | No       | From address for enquiry emails. Defaults to `SMTP_LOGIN`.             |

## Deployment

`vercel.json` sets `buildCommand: npm run build` and `outputDirectory: dist`.
Vercel deploys `api/` as serverless functions independently of
`outputDirectory`, so no extra config is needed for `api/enquiry.js`.
