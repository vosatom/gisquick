import type { GlobalQuery } from '@/store/typed'
import type { Feature, Map } from 'ol'
import type { Extent } from 'ol/extent'
import { inject, type InjectionKey } from 'vue'

export const mapKey = Symbol() as InjectionKey<Map>

export interface MapWithExt extends Map {
  ext: {
    visibleAreaPadding: () => [number, number, number, number];
    visibleAreaExtent: () => [number, number, number, number];
    fitToExtent: (extent: Extent, options?: { padding?: number[], maxZoom?: number }) => void;
    zoomToFeature: (feature: Feature, options?: { padding?: number[] }) => void;
    refreshOverlays: () => void;
    getPermalinkQueryParams: () => GlobalQuery;
    createPermalink: () => string;
  };
}

export function useOlMap () {
  return inject(mapKey) as MapWithExt
}
