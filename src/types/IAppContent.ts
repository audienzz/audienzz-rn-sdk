export interface IAppContent {
  id?: string;
  episode?: number;
  title?: string;
  series?: string;
  season?: string;
  artist?: string;
  genre?: string;
  album?: string;
  isrc?: string;
  url?: string;
  categories?: string[];
  productionQuality?: number;
  context?: number;
  contentRating?: string;
  userRating?: string;
  qaMediaRating?: number;
  keywords?: string;
  liveStream?: number;
  sourceRelationship?: number;
  length?: number;
  language?: string;
  embeddable?: number;
  dataObject?: {
    id?: string;
    name?: string;
    segments?: {
      id?: string;
      name?: string;
      value?: string;
    }[];
  };
  producerObject?: {
    id?: string;
    name?: string;
    domain?: string;
    categories?: string[];
  };
}
