import { type IAppContent } from 'audienzzrn';

export const LOREM = `Lorem ipsum dolor, sit amet consectetur adipisicing elit. Dolore ea aut soluta inventore, voluptas deserunt corrupti quos adipisci, velit hic sunt reprehenderit, totam commodi doloribus eveniet.
 Rerum dolor accusantium architecto.  Lorem ipsum dolor, sit amet consectetur adipisicing elit. Dolore ea aut soluta inventore, voluptas deserunt corrupti quos adipisci, velit hic sunt reprehenderit, totam commodi doloribus eveniet.
 Rerum dolor accusantium architecto. Lorem ipsum dolor, sit amet consectetur adipisicing elit. Dolore ea aut soluta inventore, voluptas deserunt corrupti quos adipisci, velit hic sunt reprehenderit, totam commodi doloribus eveniet.
 Rerum dolor accusantium architecto. Lorem ipsum dolor, sit amet consectetur adipisicing elit. Dolore ea aut soluta inventore, voluptas deserunt corrupti quos adipisci, velit hic sunt reprehenderit, totam commodi doloribus eveniet.
 Rerum dolor accusantium architecto. Lorem ipsum dolor, sit amet consectetur adipisicing elit. Dolore ea aut soluta inventore, voluptas deserunt corrupti quos adipisci, velit hic sunt reprehenderit, totam commodi doloribus eveniet.
 Rerum dolor accusantium architecto. Lorem ipsum dolor, sit amet consectetur adipisicing elit. Dolore ea aut soluta inventore, voluptas deserunt corrupti quos adipisci, velit hic sunt reprehenderit, totam commodi doloribus eveniet.
 Rerum dolor accusantium architecto.`;

export const APP_CONTENT_FOR_BANNER: IAppContent = {
  id: '123',
  episode: 1,
  title: 'Example Title',
  series: 'Example Series',
  season: 'Example Season',
  artist: 'Example Artist',
  genre: 'Example Genre',
  album: 'Example Album',
  isrc: '123456',
  url: 'https://example.com',
  categories: ['Category1', 'Category2'],
  productionQuality: 5,
  context: 1,
  contentRating: 'PG',
  userRating: '4.5',
  qaMediaRating: 3,
  keywords: 'example, keywords',
  liveStream: 0,
  sourceRelationship: 1,
  length: 120,
  language: 'English',
  embeddable: 1,
  dataObject: {
    id: '456',
    name: 'Data Object',
    segments: [
      {
        id: 'segment1',
        name: 'Segment 1',
        value: 'Value 1',
      },
      {
        id: 'segment2',
        name: 'Segment 2',
        value: 'Value 2',
      },
    ],
  },
  producerObject: {
    id: '789',
    name: 'Producer Object',
    domain: 'example.com',
    categories: ['Category3', 'Category4'],
  },
};
export const APP_CONTENT_FOR_INTERSTITIAL: IAppContent = {
  id: '345',
  episode: 1,
  title: 'Example Title',
  series: 'Example Series',
  season: 'Example Season',
  artist: 'Example Artist',
  album: 'Example Album',
  isrc: '123456',
  url: 'https://example.com',
  productionQuality: 5,
  context: 1,
  contentRating: 'PG',
  userRating: '4.5',
  qaMediaRating: 3,
  keywords: 'example, keywords',
  liveStream: 0,
  sourceRelationship: 1,
  length: 120,
  embeddable: 1,
  dataObject: {
    id: '546',
    name: 'Data Object',
    segments: [
      {
        id: 'segment2',
        name: 'Segment 2',
        value: 'Value 2',
      },
    ],
  },
  producerObject: {
    id: '789',
    name: 'Producer Object',
    domain: 'example.com',
  },
};
export const APP_CONTENT_FOR_REWARDED: IAppContent = {
  id: '23',
  artist: 'Example Artist',
  genre: 'Example Genre',
  album: 'Example Album',
  isrc: '123456',
  url: 'https://example.com',
  categories: ['Category1', 'Category2'],
  productionQuality: 5,
  context: 1,
  contentRating: 'PG',
  userRating: '4.5',
  qaMediaRating: 3,
  keywords: 'example, keywords',
  liveStream: 0,
  sourceRelationship: 1,
  length: 120,
  language: 'English',
  embeddable: 1,
  dataObject: {
    id: '456',
    name: 'Data Object',
  },
};
