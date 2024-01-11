import { type Meta } from '@storybook/vue3'
import { Feature } from 'ol'

import FeatureEditor from '@/components/feature-editor/FeatureEditor.vue'
import NewFeatureEditor from '@/components/feature-editor/NewFeatureEditor.vue'
import { config } from '@/modules/routing/config'
import appData from '@/modules/storybook/mocks/app.json'
import project from '@/modules/storybook/mocks/project.json'
import Preview from '@/modules/storybook/Preview.vue'
import { setup } from '@/modules/storybook-compat'
import { store } from '@/store/typed'
import Swiper from '@/swiper'

const layer = project.layers[1].layers[0]

const data = [
  {
    id: 0,
    adm0_a3: null,
    gdp_md_est: 265200,
    name: 'Czech Rep.',
    pop_est: 10211904,
    subregion: 'Eastern Europe',
  },
  {
    id: 1,
    adm0_a3: null,
    gdp_md_est: 265200,
    name: 'Czech Rep.',
    pop_est: 10211904,
    subregion: 'Eastern Europe',
  },
]

const feature = new Feature({ ...data[0] })
feature.setId(`mnk_pois.${data[0].id}`)

const featureWithRelationsData = new Feature({ ...data[0] })
feature.setId(`mnk_pois.${data[0].id}`)

const relationFeature = new Feature({
  id: 4716,
  author_id: 2,
  created_at: '2023-01-26T10:22:18.895Z',
  desc: 'Nothing',
  last_modification: '2023-01-26T10:22:18.895Z',
  license_id: 2,
  name: 'My beautiful photo',
  order: 1,
  photo: 'photo/IMG_13668.JPG',
  photographer: 'Carl',
  poi_id: 0,
  status_id: 4,
  updated_by_id: 2,
})
relationFeature.setId('webmap_photos.4716')
featureWithRelationsData._relationsData = {
  Photos: [relationFeature],
}

export default {
  title: 'Feature Editor/Feature Editor',
  component: FeatureEditor,
  render: (args) => ({
    components: { FeatureEditor, Preview },
    setup() {
      setup((app) => {
        store.commit('routing/init', { config })
        store.commit('app', appData.app)
        store.commit('user', appData.user)
        store.commit('project', project)

        app.use(Swiper)
      })

      return { args }
    },
    data() {
      return { values: null }
    },
    mounted() {
      this.values = this.$refs.editor.fields
    },
    template: `<Preview><FeatureEditor v-bind="args" ref="editor" /><portal-target name="test-panel" /><pre if="values">{{ JSON.stringify(values, null, '  ') }}</pre></Preview>`,
  }),

  args: {
    feature,
    project,
    toolbarTarget: 'test-panel',
  },
} as Meta

export const PointEdit = {
  args: {
    layer: { ...layer, wkb_type: 'Point' },
  },
}
export const LineStringEdit = {
  args: {
    layer: { ...layer, wkb_type: 'LineString' },
  },
}
export const PolygonEdit = {
  args: {
    layer: { ...layer, wkb_type: 'Polygon' },
  },
}
export const MultiPointEdit = {
  args: {
    layer: { ...layer, wkb_type: 'MultiPoint' },
  },
}
export const MultiLineStringEdit = {
  args: {
    layer: { ...layer, wkb_type: 'MultiLineString' },
  },
}
export const MultiPolygonEdit = {
  args: {
    layer: { ...layer, wkb_type: 'MultiPolygon' },
  },
}

export const Relations = {
  args: {
    feature: featureWithRelationsData,
    layer: {
      ...layer,
      relations: [
        {
          name: 'Photos',
          referencing_layer: 'webmap_photos_poi',
          strength: 0,
          referencing_fields: ['poi_id'],
          referenced_fields: ['id'],
        },
      ],
    },
  },
}

export const NewFeature = {
  title: 'Feature Editor/New Feature Editor',
  component: NewFeatureEditor,
  render: (args) => ({
    components: { NewFeatureEditor, Preview },
    setup() {
      setup((app) => {
        store.commit('routing/init', { config })
        store.commit('app', appData.app)
        store.commit('user', appData.user)
        store.commit('project', project)

        app.use(Swiper)
      })

      return { args }
    },
    data() {
      return { values: null }
    },
    mounted() {
      this.values = this.$refs.editor.fields
    },
    template: `<Preview><NewFeatureEditor v-bind="args" ref="editor" /><portal-target name="test-panel" /><pre if="values">{{ JSON.stringify(values, null, '  ') }}</pre></Preview>`,
  }),

  args: {
    feature: undefined,
    project: undefined,
    layer: {
      ...layer,
      wkb_type: 'Point',
      relations: [
        {
          name: 'Photos',
          referencing_layer: 'webmap_photos_poi',
          strength: 0,
          referencing_fields: ['poi_id'],
          referenced_fields: ['id'],
        },
      ],
    },
    toolbarTarget: 'test-panel',
  },
}
