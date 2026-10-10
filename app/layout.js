import './styles/styles.css';
import './styles/final-theme.css';
import './styles/editorial-theme.css';
import './styles/portrait-motion.css';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://anas-sarhan-portfolio.vercel.app';

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: 'Anas Sarhan | Motion Graphic Designer',
  description:
    'Anas Sarhan — Motion Graphic Designer creating motion graphics, animation, video editing and visual effects with After Effects, Illustrator and Photoshop.',
  robots: { index: true, follow: true },
  icons: { icon: '/assets/favicon.svg' },
  openGraph: {
    type: 'website',
    title: 'Anas Sarhan | Motion Graphic Designer',
    description: 'Motion Graphics · Animation · Visual Effects',
    images: ['/assets/og-cover.png'],
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#1d0e29',
};

// Applies the saved theme before first paint to avoid a dark/light flash.
const themeScript = `try{const t=localStorage.getItem('mt-theme');document.documentElement.className=t==='light'?'light':'dark';}catch(e){}`;

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Inter:wght@400;500;600;700;800;900&display=swap"
        />
        <link rel="preload" as="image" href="/assets/anas-cutout.png" />
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
