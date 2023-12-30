import type {
  AutocompleteLookupResult,
  AutocompleteResult,
  GeocodeResult,
  IsolineResult,
  ReverseGeocodeResult,
  RouteResult,
} from './types'

export interface IBaseTransformer {
  transformRoute?(
    data: object,
    options?: { includeElevations?: boolean },
  ): RouteResult

  transformAutocomplete?(data: object): AutocompleteResult

  transformAutocompleteLookup?(data: object): AutocompleteLookupResult

  transformIsoline?(data: object): IsolineResult

  transformGeocode?(data: object): GeocodeResult

  transformReverseGeocode?(data: object): ReverseGeocodeResult
}

export abstract class BaseTransformer {}
