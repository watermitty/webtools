const fs = require('fs');
const path = require('path');

const routerPath = path.resolve(__dirname, '../src/router/router.ts');
const publicPath = path.resolve(__dirname, '../public');
const sitemapPath = path.join(publicPath, 'sitemap.xml');
const DOMAIN = 'https://toolsonline.dpdns.org';

// Ensure public directory exists
if (!fs.existsSync(publicPath)) {
    fs.mkdirSync(publicPath, { recursive: true });
}

const content = fs.readFileSync(routerPath, 'utf-8');
const regex = /path:\s*['"]([^'"]+)['"]/g;
let match;
const routes = [];

// Base routes to exclude
const excludedRoutes = [
    '/404',
    '/login',
    '/userinfo',
    '/about' // Maybe include about? Let's include it.
];

while ((match = regex.exec(content)) !== null) {
    const route = match[1];

    // Basic filtering
    if (
        !route.includes(':') && // exclude dynamic routes
        !route.includes('*') && // exclude wildcards
        !excludedRoutes.includes(route)
    ) {
        if (!routes.includes(route)) {
            routes.push(route);
        }
    }
}

// Sort routes
routes.sort();

// Add current date
const lastMod = new Date().toISOString().split('T')[0];

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes.map(route => `  <url>
    <loc>${DOMAIN}${route}</loc>
    <lastmod>${lastMod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${route === '/' ? '1.0' : '0.8'}</priority>
  </url>`).join('\n')}
</urlset>`;

fs.writeFileSync(sitemapPath, sitemap);
console.log(`Sitemap generated at ${sitemapPath} with ${routes.length} routes.`);
