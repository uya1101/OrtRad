export interface RssFeed {
  source: string;
  name: string;
  url: string;
  type: 'rss' | 'atom';
}

export const RSS_FEEDS: RssFeed[] = [
  {
    source: 'jbjs',
    name: 'JBJS (Journal of Bone and Joint Surgery)',
    url: 'https://journals.lww.com/jbjsjournal/_layouts/15/15/OAKS rss.aspx?Feed=JBJS',
    type: 'rss'
  },
  {
    source: 'bone_joint',
    name: 'The Bone & Joint Journal',
    url: 'https://journals.sagepub.com/action/showFeed?type=etoc&feed=rss&jc=bonj',
    type: 'rss'
  },
  {
    source: 'acta_ortho',
    name: 'Acta Orthopaedica',
    url: 'https://journals.sagepub.com/action/showFeed?type=etoc&feed=rss&jc=acor',
    type: 'rss'
  },
  {
    source: 'clinical_ortho',
    name: 'Clinical Orthopaedics and Related Research',
    url: 'https://link.springer.com/search.rss?facet-journal-id=3265',
    type: 'rss'
  },
  {
    source: 'aaos',
    name: 'AAOS News',
    url: 'https://www.aaos.org/rss/',
    type: 'rss'
  }
];

export const COLLECTION_LOG_STATUSES = ['pending', 'running', 'completed', 'failed'] as const;
export type CollectionLogStatus = typeof COLLECTION_LOG_STATUSES[number];
