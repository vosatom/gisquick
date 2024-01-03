import { Feature, Map, MapBrowserEvent } from 'ol'
import type { Coordinate } from 'ol/coordinate'
import Event from 'ol/events/Event'
import { Point } from 'ol/geom'
import PointerInteraction from 'ol/interaction/Pointer'
import VectorLayer from 'ol/layer/Vector'
import VectorSource from 'ol/source/Vector'
import type { StyleLike } from 'ol/style/Style'

export class FeatureDragEvent extends Event {
  feature: Feature | undefined

  constructor(type: string, feature: Feature | undefined) {
    super(type)

    this.feature = feature
  }
}
export class FeatureDrag extends PointerInteraction {
  activeFeature_: Feature | undefined = undefined
  hoveredFeature_: Feature | undefined = undefined
  startedModifying_: Feature | undefined = undefined
  startCoordinates_: Coordinate | undefined = undefined
  source_: VectorSource
  overlaySource_: VectorSource
  inputSource_: VectorSource
  pathLayer_: VectorLayer<VectorSource>
  hitTolerance_ = 0
  hasStarted = false

  overlayLayer_: VectorLayer<VectorSource> | undefined = undefined
  overlayLayerSource_: VectorSource | undefined = undefined
  overlayHoverFeature_: Feature | undefined = undefined

  constructor({
    source,
    inputSource,
    pathLayer,
    style,
    hitTolerance,
    ...options
  }: {
    source: VectorSource
    inputSource: VectorSource
    pathLayer: VectorLayer<VectorSource>
    style?: StyleLike
    hitTolerance?: number
  }) {
    super(options)

    this.source_ = source
    this.inputSource_ = inputSource
    this.pathLayer_ = pathLayer
    this.hitTolerance_ = hitTolerance

    this.overlaySource_ = new VectorSource()

    this.overlayHoverFeature_ = undefined

    if (style) {
      this.overlayLayerSource_ = new VectorSource()
      this.overlayLayer_ = new VectorLayer({
        source: this.overlayLayerSource_,
        style,
      })
    }
  }

  setMap(map: Map | null): void {
    if (this.overlayLayer_) {
      this.overlayLayer_.setMap(map)
    }

    super.setMap(map)
  }

  protected getHoveredFeature(
    mapBrowserEvent: MapBrowserEvent<PointerEvent>,
  ): Feature | undefined {
    let result: Feature | undefined
    const map = this.getMap()
    if (!map) return result

    map.forEachFeatureAtPixel(
      mapBrowserEvent.pixel,
      (feature) => {
        if (
          feature instanceof Feature &&
          this.inputSource_.getFeatures().includes(feature)
        ) {
          result = feature
        }
        return true
      },
      {
        layerFilter: (layer) => layer !== this.overlayLayer_,
        hitTolerance: this.hitTolerance_,
      },
    )

    return result
  }

  protected handleMoveEvent(
    mapBrowserEvent: MapBrowserEvent<PointerEvent>,
  ): void {
    const map = this.getMap()
    if (!map) return

    if (this.hasStarted) return

    const hoveredFeature = this.getHoveredFeature(mapBrowserEvent)

    if (hoveredFeature !== this.hoveredFeature_) {
      this.hoveredFeature_ = hoveredFeature
      this.dispatchEvent(new FeatureDragEvent('hover', hoveredFeature))
    }

    if (this.overlayLayerSource_) {
      if (hoveredFeature) {
        const hoveredCoordinate = hoveredFeature
          .getGeometry()
          ?.getClosestPoint(mapBrowserEvent.coordinate)

        if (hoveredCoordinate && hoveredFeature?.get('isActive')) {
          if (!this.overlayHoverFeature_) {
            this.overlayHoverFeature_ = new Feature(
              new Point(hoveredCoordinate),
            )
            this.overlayLayerSource_.addFeature(this.overlayHoverFeature_)
          }
          this.overlayHoverFeature_.setGeometry(new Point(hoveredCoordinate))
        }
      } else {
        if (this.overlayHoverFeature_) {
          this.overlayLayerSource_.removeFeature(this.overlayHoverFeature_)
          this.overlayHoverFeature_ = undefined
        }
      }
    }

    if (this.activeFeature_) {
      this.overlaySource_.removeFeature(this.activeFeature_)
      this.activeFeature_ = undefined
    }
    if (this.hoveredFeature_) {
      this.activeFeature_ = new Feature(new Point(mapBrowserEvent.coordinate))
      this.activeFeature_.set('source', 'featuredrag')
      this.overlaySource_.addFeature(this.activeFeature_)
    }
  }

  protected handleDownEvent(
    mapBrowserEvent: MapBrowserEvent<PointerEvent>,
  ): boolean {
    const hoveredFeature = this.getHoveredFeature(mapBrowserEvent)

    if (hoveredFeature !== this.hoveredFeature_) {
      this.hoveredFeature_ = hoveredFeature
      this.dispatchEvent(new FeatureDragEvent('hover', hoveredFeature))
    }
    if (this.hoveredFeature_) {
      this.activeFeature_ = new Feature(new Point(mapBrowserEvent.coordinate))
      this.activeFeature_.set('source', 'featuredrag')
      this.overlaySource_.addFeature(this.activeFeature_)
    }

    if (this.activeFeature_) {
      this.startedModifying_ = this.activeFeature_

      this.startCoordinates_ = this.startedModifying_
        .getGeometry()
        ?.getCoordinates()

      if (this.hoveredFeature_) {
        if (this.hoveredFeature_.get('isActive')) {
          this.source_.addFeature(this.startedModifying_)
        } else {
          this.dispatchEvent(
            new FeatureDragEvent('selectpath', this.hoveredFeature_),
          )
        }
      }

      if (this.overlayLayerSource_ && this.overlayHoverFeature_) {
        this.overlayLayerSource_.removeFeature(this.overlayHoverFeature_)
        this.overlayHoverFeature_ = undefined
      }

      return true
    }
    return false
  }

  protected handleDragEvent(
    mapBrowserEvent: MapBrowserEvent<PointerEvent>,
  ): boolean {
    if (this.startedModifying_) {
      if (!this.hasStarted) {
        this.dispatchEvent(
          new FeatureDragEvent('modifystart', this.startedModifying_),
        )

        const features = this.source_.getFeaturesAtCoordinate(
          this.startCoordinates_,
        )

        if (features.length) {
          this.startedModifying_ = features[0]
        }
        this.hasStarted = true
      }

      this.startedModifying_
        .getGeometry()
        .setCoordinates(mapBrowserEvent.coordinate)

      this.dispatchEvent(
        new FeatureDragEvent('changefeature', this.startedModifying_),
      )

      return true
    }
    return false
  }

  protected handleUpEvent(event: MapBrowserEvent<PointerEvent>): boolean {
    let consumed = false
    if (this.activeFeature_) {
      this.overlaySource_.removeFeature(this.activeFeature_)
      consumed = true
    }
    this.startedModifying_ = undefined
    this.activeFeature_ = undefined
    this.hasStarted = false

    this.dispatchEvent(
      new FeatureDragEvent('modifyend', this.startedModifying_),
    )

    event.stopPropagation()
    event.preventDefault()

    return consumed
  }
}
