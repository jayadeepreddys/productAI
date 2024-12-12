"use client";

import './globals.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link href="/tailwind.css" rel="stylesheet" />
      </head>
      <body>
        <div id="preview-root" className="min-h-screen">
          {children}
        </div>
      </body>
    </html>
  );
}
      