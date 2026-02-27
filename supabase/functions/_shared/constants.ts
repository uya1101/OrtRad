export interface RssFeed {
  source: string;
  name: string;
  url: string;
  type: 'rss' | 'atom';
}

export const RSS_FEEDS: RssFeed[] = [
  {
    source: 'jaaos',
    name: 'JAAOS',
    url: 'https://journals.lww.com/jaaos/pages/feed.aspx',
    type: 'rss'
  },
  {
    source: 'radiology',
    name: 'Radiology (RSNA)',
    url: 'https://pubs.rsna.org/action/showFeed?type=etoc&feed=rss&jc=radiology',
    type: 'rss'
  },
  {
    source: 'eur_radiology',
    name: 'European Radiology',
    url: 'https://link.springer.com/search.rss?search-within=Journal&facet-journal-id=330&query=orthopedic',
    type: 'rss'
  },
  {
    source: 'rsna',
    name: 'RSNA News',
    url: 'https://www.rsna.org/news/rsna-news-rss',
    type: 'rss'
  }
];

export const COLLECTION_LOG_STATUSES = ['pending', 'running', 'completed', 'failed'] as const;
export type CollectionLogStatus = typeof COLLECTION_LOG_STATUSES[number];
