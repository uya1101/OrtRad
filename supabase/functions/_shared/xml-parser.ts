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
 * Extract text content from XML tag
 */
function extractTagText(xml: string, tagName: string): string | null {
  // Match <tagName>content</tagName> or <tagName attr="value">content</tagName>
  const regex = new RegExp(`<${tagName}[^>]*>(.*?)</${tagName}>`, 's');
  const match = xml.match(regex);
  if (match && match[1]) {
    // Remove CDATA wrapper if present
    return match[1].replace(/^<!\[CDATA\[|\]\]>$/g, '').trim();
  }
  return null;
}

/**
 * Extract text content from multiple XML tags
 */
function extractMultipleTagTexts(xml: string, tagName: string): string[] {
  const results: string[] = [];
  const regex = new RegExp(`<${tagName}[^>]*>(.*?)</${tagName}>`, 'gs');
  let match;

  while ((match = regex.exec(xml)) !== null) {
    if (match[1]) {
      const text = match[1].replace(/^<!\[CDATA\[|\]\]>$/g, '').trim();
      if (text) results.push(text);
    }
  }

  return results;
}

/**
 * Extract attribute value from XML tag
 */
function extractAttribute(xml: string, tagName: string, attrName: string): string | null {
  const regex = new RegExp(`<${tagName}[^>]*\\s${attrName}=["']([^"']*)["'][^>]*>`, 'i');
  const match = xml.match(regex);
  return match ? match[1] : null;
}

/**
 * Parse a single PubMed article from XML
 */
function parseSinglePubmedArticle(articleXml: string): ParsedArticle | null {
  try {
    // Get PMID
    const pmid = extractTagText(articleXml, 'PMID');
    if (!pmid) return null;

    // Get Title
    const title = extractTagText(articleXml, 'ArticleTitle');
    if (!title) return null;

    // Get Authors
    const authors: string[] = [];
    const lastNameRegex = /<LastName>(.*?)<\/LastName>/gs;
    const foreNameRegex = /<ForeName>(.*?)<\/ForeName>/gs;
    const initialsRegex = /<Initials>(.*?)<\/Initials>/gs;

    let lastNameMatch, foreNameMatch, initialsMatch;
    while ((lastNameMatch = lastNameRegex.exec(articleXml)) !== null) {
      const lastName = lastNameMatch[1].trim();
      foreNameMatch = foreNameRegex.exec(articleXml);
      initialsMatch = initialsRegex.exec(articleXml);

      const foreName = foreNameMatch ? foreNameMatch[1].trim() : '';
      const initials = initialsMatch ? initialsMatch[1].trim() : '';

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
    const journal = extractTagText(articleXml, 'Title') || '';

    // Get Abstract
    const abstract = extractTagText(articleXml, 'AbstractText');

    // Get Published Date
    let publishedAt: string | null = null;
    const yearMatch = articleXml.match(/<Year>(\d{4})<\/Year>/);
    const monthMatch = articleXml.match(/<Month>(\d{1,2})<\/Month>/);
    const dayMatch = articleXml.match(/<Day>(\d{1,2})<\/Day>/);

    if (yearMatch) {
      const year = yearMatch[1];
      const month = monthMatch ? monthMatch[1].padStart(2, '0') : '01';
      const day = dayMatch ? dayMatch[1].padStart(2, '0') : '01';
      publishedAt = `${year}-${month}-${day}T00:00:00Z`;
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
    console.error('Error parsing single PubMed article:', error);
    return null;
  }
}

/**
 * Parse PubMed XML response (returns array of articles)
 */
export function parsePubmedXml(xmlString: string): ParsedArticle[] {
  try {
    const articles: ParsedArticle[] = [];

    // Split by PubmedArticle tag
    const articleRegex = /<PubmedArticle>[\s\S]*?<\/PubmedArticle>/g;
    let match;

    while ((match = articleRegex.exec(xmlString)) !== null) {
      const article = parseSinglePubmedArticle(match[0]);
      if (article) {
        articles.push(article);
      }
    }

    return articles;
  } catch (error) {
    console.error('Error parsing PubMed XML:', error);
    return [];
  }
}

/**
 * Parse RSS/Atom XML response
 */
export function parseRssFeed(xmlString: string, source: string): ParsedRssItem[] {
  try {
    const items: ParsedRssItem[] = [];

    // Check if RSS 2.0
    if (xmlString.includes('<rss') || xmlString.includes('<item>')) {
      const itemRegex = /<item>[\s\S]*?<\/item>/g;
      let match;

      while ((match = itemRegex.exec(xmlString)) !== null) {
        const itemXml = match[0];

        const title = extractTagText(itemXml, 'title');
        const link = extractTagText(itemXml, 'link');
        const pubDate = extractTagText(itemXml, 'pubDate');
        const description = extractTagText(itemXml, 'description');
        const guid = extractTagText(itemXml, 'guid');

        if (title && link) {
          items.push({
            title,
            link,
            pubDate,
            description,
            guid: guid || link,
          });
        }
      }
    }
    // Check if Atom
    else if (xmlString.includes('<feed') || xmlString.includes('<entry>')) {
      const entryRegex = /<entry>[\s\S]*?<\/entry>/g;
      let match;

      while ((match = entryRegex.exec(xmlString)) !== null) {
        const entryXml = match[0];

        const title = extractTagText(entryXml, 'title');
        const published = extractTagText(entryXml, 'published');
        const summary = extractTagText(entryXml, 'summary');
        const id = extractTagText(entryXml, 'id');

        // Get link from <link href="..."> format
        const link = extractAttribute(entryXml, 'link', 'href');

        if (title && link) {
          items.push({
            title,
            link,
            pubDate: published,
            description: summary,
            guid: id || link,
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
