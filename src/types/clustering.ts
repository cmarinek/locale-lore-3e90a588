export interface ClusterPoint {
  type: 'Feature';
  geometry: {
    type: 'Point';
    coordinates: [number, number];
  };
  properties: {
    id: string;
    title: string;
    category: string;
    verified: boolean;
    voteScore: number;
    authorName?: string;
  };
}

export interface Cluster {
  id: string;
  coordinates: [number, number];
  properties: {
    cluster: true;
    cluster_id: number;
    point_count: number;
    point_count_abbreviated: string;
  };
}

export interface ClusteringOptions {
  radius: number;
  maxZoom: number;
  minZoom: number;
  minPoints: number;
}

export type MapFeature = ClusterPoint | Cluster;