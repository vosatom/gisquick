export interface AutocompletePayload {
  items: Item[]
}

interface Item {
  title: string
  id: string
  resultType: string
  address: ItemAddress
  position: Position
  access?: Position[]
  distance: number
  categories?: Category[]
  references?: Reference[]
  highlights: Highlights
  mapView?: MapView
}

interface Position {
  lat: number
  lng: number
}

interface ItemAddress {
  label: string
}

interface Category {
  id: string
  name: string
  primary?: boolean
}

interface Highlights {
  title: Highlight[]
  address: HighlightsAddress
}

interface HighlightsAddress {
  label: Highlight[]
}

interface Highlight {
  start: number
  end: number
}

interface MapView {
  west: number
  south: number
  east: number
  north: number
}

interface Reference {
  supplier: Supplier
  id: string
}

interface Supplier {
  id: string
}

export interface ReverseGeocodePayload {
  items: ReverseGeocodeItem[]
}

interface ReverseGeocodeItem {
  title: string
  id: string
  resultType: string
  address: Address
  position: Position
  distance: number
  mapView: MapView
}

interface Address {
  label: string
  countryCode: string
  countryName: string
  state: string
  county: string
  city: string
  district: string
  street: string
  postalCode: string
}


