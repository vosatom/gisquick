import type { ServicesConfig } from '../services/base/configTypes'

export const config: ServicesConfig = {
  providers: {
    fake: {
      id: 'fake',
      type: 'fake',
      settings: {
        profiles: [
          {
            id: 'bike',
            label: 'Bike',
          },
          {
            id: 'mtb',
            label: 'Mountain Bike',
          },
          {
            id: 'foot',
            label: 'Foot',
          },
        ],
      },
    },
  },

  features: {
    route: {
      id: 'route',
      enabled: true,
      provider: 'fake',
      settings: {
        alternatives: true,
        autoUpdate: true,
        elevation: false,
        details: [
          'country',
          'max_weight',
          'max_width',
          'toll',
          'lanes',
          'surface',
          'hike_rating',
          'foot_network',

          'street_name',
          'street_ref',
          'street_destination',
          'roundabout',
          'time',
          'distance',
          'max_speed',
          'road_class',
          'road_class_link',
          'road_access',
          'road_environment',
          'smoothness',
          'bike_network',
          'get_off_bike',
        ],
        instructions: true,
        instructionsSigns: true,
        defaultProfile: 'bike',
        maxPoints: 0,
      },
    },
    autocomplete: {
      id: 'autocomplete',
      enabled: true,
      provider: 'fake',
      settings: {
        autoUpdate: true,
        biasToMapView: true,
      },
    },
    search: {
      id: 'search',
      enabled: true,
      provider: ['fake'],
      settings: {
        autoUpdate: true,
        biasToMapView: true,
      },
    },

    isoline: {
      id: 'isoline',
      enabled: true,
      provider: 'fake',
      settings: { autoUpdate: true, distance: true, time: true },
    },
    geocode: { id: 'geocode', enabled: true, provider: 'fake', settings: {} },
    reverseGeocode: {
      id: 'reverseGeocode',
      enabled: true,
      provider: 'fake',
      settings: {},
    },
  },
}
