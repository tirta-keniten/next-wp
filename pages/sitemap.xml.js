import { getAllPagesForSitemap } from '../lib/api'


export default function Sitemap () {
  return ''
}

export async function getServerSideProps ({ res }) {
  const pages = await getAllPagesForSitemap()

  const baseURL = process.env.VERCEL_URL

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
      ${pages.map( (page) => {
        return `
        <url>
          <loc>${baseURL}${page.uri}</loc>
          <lastmod>${page.date}</lastmod>
          ${page.translated.map( ({ locale }) => {
            return `
            <xhtml:link rel="alternate" hreflang="${locale.id}" href="${baseURL}/${locale.id}${page.uri}"/>
            `
          }).join('')}
        </url>
      `
      } ).join('')}
    </urlset>
  `;

  res.setHeader("Content-Type", "text/xml");
  res.write(sitemap);
  res.end();

  return { props: {} }
}