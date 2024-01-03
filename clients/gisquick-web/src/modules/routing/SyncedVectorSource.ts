import type Feature from 'ol/Feature'
import VectorSource, {
  type Options as VectorSourceOptions,
} from 'ol/source/Vector'

interface Options extends VectorSourceOptions {
  handleChangeFeature?: (feature?: Feature) => void
  handleAddFeature?: (feature?: Feature) => void
}

export class SyncedVectorSource extends VectorSource {
  modifyingFeatures = false

  modifyingCollection = false

  checkModify(callback: Function) {
    if (!this.modifyingCollection) {
      this.modifyingCollection = true
      callback()
      this.modifyingCollection = false
    }
  }

  constructor(options: Options) {
    super(options)

    const { handleAddFeature, handleChangeFeature } = options
    if (handleChangeFeature) {
      this.on('changefeature', event => {
        this.checkModify(() => {
          handleChangeFeature(event.feature)
        })
      })
    }

    if (handleAddFeature) {
      this.on('addfeature', event => {
        this.checkModify(() => {
          handleAddFeature(event.feature)
        })
      })
    }
  }

  public syncFeatures(callback: () => Feature[]) {
    if (this.modifyingFeatures) return
    this.checkModify(() => {
      const features = callback()
      this.clear(true)
      this.addFeatures(features)
    })
  }
}
