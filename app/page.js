import fs from 'node:fs';
import path from 'node:path';
import Script from 'next/script';

// The markup lives in content/body.html and is read at build time (static page).
const html = fs.readFileSync(path.join(process.cwd(), 'content', 'body.html'), 'utf8');

export default function Home() {
  return (
    <>
      <div id="site-root" style={{ display: 'contents' }} dangerouslySetInnerHTML={{ __html: html }} />
      {/* Interactions (theme, motion, tabs, filters, command palette...) */}
      <Script src="/app.js" strategy="afterInteractive" />
    </>
  );
}
