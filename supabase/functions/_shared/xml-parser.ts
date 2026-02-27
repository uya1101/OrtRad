export interface ParsedArticle {
  title: string;
  authors: string[];
  journal: string;
  published_at: string | null;
  abstract: string | null;
  source_id: string;
  source_url: string | null;
}

export interface ParsedRssItem {
  title: string;
  link: string;
  pubDate: string | null;
  description: string | null;
  guid: string | null;
}

/**
 * Parse PubMed XML response
 */
export function parsePubmedXml(xmlString: string): ParsedArticle | null {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xmlString, 'text/xml');

    const article = doc.querySelector('PubmedArticle');
    if (!article) return null;

    // Get PMID
    const pmidElement = article.querySelector('PMID');
    const pmid = pmidElement?.textContent?.trim();
    if (!pmid) return null;

    // Get Title
    const titleElement = article.querySelector('ArticleTitle');
    const title = titleElement?.textContent?.trim() || '';

    // Get Authors
    const authors: string[] = [];
    const authorList = article.querySelectorAll('Author');
    for (const author of authorList) {
      const lastName = author.querySelector('LastName')?.textContent?.trim();
      const foreName = author.querySelector('ForeName')?.textContent?.trim();
      const initials = author.querySelector('Initials')?.textContent?.trim();

      let authorName = '';
      if (lastName && foreName) {
        authorName = `${foreName} ${lastName}`;
      } else if (lastName && initials) {
        authorName = `${initials} ${lastName}`;
      } else if (lastName) {
        authorName = lastName;
      }

      if (authorName) {
        authors.push(authorName);
      }
    }

    // Get Journal
    const journalElement = article.querySelector('Journal > Title');
    const journal = journalElement?.textContent?.trim() || '';

    // Get Abstract
    const abstractElement = article.querySelector('AbstractText');
    const abstract = abstractElement?.textContent?.trim() || null;

    // Get Published Date (from ArticleDate or PubDate)
    const pubDateElement = article.querySelector('ArticleDate');
    const year = pubDateElement?.querySelector('Year')?.textContent?.trim();
    const month = pubDateElement?.querySelector('Month')?.textContent?.trim();
    const day = pubDateElement?.querySelector('Day')?.textContent?.trim();

    let publishedAt: string | null = null;
    if (year) {
      const monthStr = month || '01';
      const dayStr = day || '01';
      publishedAt = `${year}-${monthStr}-${dayStr}T00:00:00Z`;
    }

    return {
      title,
      authors,
      journal,
      published_at: publishedAt,
      abstract,
      source_id: pmid,
      source_url: `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`,
    };
  } catch (error) {
    console.error('Error parsing PubMed XML:', error);
    return null;
  }
}

/**
 * Parse RSS/Atom XML response
 */
export function parseRssFeed(xmlString: string, source: string): ParsedRssItem[] {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xmlString, 'text/xml');

    const items: ParsedRssItem[] = [];

    // Check if RSS or Atom
    const rssRoot = doc.querySelector('rss');
    const atomRoot = doc.querySelector('feed');

    if (rssRoot) {
      // RSS 2.0
      const rssItems = doc.querySelectorAll('channel > item');
      for (const item of rssItems) {
        const title = item.querySelector('title')?.textContent?.trim() || '';
        const link = item.querySelector('link')?.textContent?.trim() || '';
        const pubDate = item.querySelector('pubDate')?.textContent?.trim() || null;
        const description = item.querySelector('description')?.textContent?.trim() || null;
        const guid = item.querySelector('guid')?.textContent?.trim() || link;

        if (title && link) {
          items.push({ title, link, pubDate, description, guid });
        }
      }
    } else if (atomRoot) {
      // Atom
      const atomEntries = doc.querySelectorAll('entry');
      for (const entry of atomEntries) {
        const title = entry.querySelector('title')?.textContent?.trim() || '';
        const linkElement = entry.querySelector('link');
        const link = linkElement?.getAttribute('href') || '';
        const published = entry.querySelector('published')?.textContent?.trim() || null;
        const summary = entry.querySelector('summary')?.textContent?.trim() || null;
        const id = entry.querySelector('id')?.textContent?.trim() || link;

        if (title && link) {
          items.push({
            title,
            link,
            pubDate: published,
            description: summary,
            guid: id
          });
        }
      }
    }

    return items;
  } catch (error) {
    console.error('Error parsing RSS/Atom feed:', error);
    return [];
  }
}

/**
 * Create a hash from a string (for generating source_id from URL)
 */
export function createHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(16);
}
