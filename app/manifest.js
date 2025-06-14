export default function manifest() {
  return {
    name: 'OSINT Tools',
    short_name: 'OSINT Tools',
    description: 'A curated collection of open source intelligence tools and resources',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#000000',
    icons: [
      {
        src: './icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
      },
    ],
  }
}