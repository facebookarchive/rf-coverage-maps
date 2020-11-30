
declare module "@deck.gl/core" {
    declare export { COORDINATE_SYSTEM } from "@deck.gl/core/lib/constants";

    declare export { default as LightingEffect } from "@deck.gl/core/effects/lighting/lighting-effect";

    declare export { AmbientLight } from "@deck.gl/core/effects/lighting/ambient-light";

    declare export { DirectionalLight } from "@deck.gl/core/effects/lighting/directional-light";

    declare export { PointLight } from "@deck.gl/core/effects/lighting/point-light";

    declare export { default as _CameraLight } from "@deck.gl/core/effects/lighting/camera-light";

    declare export { default as _SunLight } from "@deck.gl/core/effects/lighting/sun-light";

    declare export { default as PostProcessEffect } from "@deck.gl/core/effects/post-process-effect";

    declare export { default as _LayersPass } from "@deck.gl/core/passes/layers-pass";

    declare export { default as Deck } from "@deck.gl/core/lib/deck";

    declare export { default as LayerManager } from "@deck.gl/core/lib/layer-manager";

    declare export { default as AttributeManager } from "@deck.gl/core/lib/attribute/attribute-manager";

    declare export { default as Layer } from "@deck.gl/core/lib/layer";

    declare export { default as CompositeLayer } from "@deck.gl/core/lib/composite-layer";

    declare export { default as DeckRenderer } from "@deck.gl/core/lib/deck-renderer";

    declare export { default as Viewport } from "@deck.gl/core/viewports/viewport";

    declare export { default as WebMercatorViewport } from "@deck.gl/core/viewports/web-mercator-viewport";

    declare export {
      picking,
      project,
      project32,
      gouraudLighting,
      phongLighting,
      shadow,
    } from "@deck.gl/core/shaderlib";

    declare export { default as View } from "@deck.gl/core/views/view";

    declare export { default as MapView } from "@deck.gl/core/views/map-view";

    declare export { default as FirstPersonView } from "@deck.gl/core/views/first-person-view";

    declare export {
      default as OrbitView,
      OrbitViewState,
    } from "@deck.gl/core/views/orbit-view";

    declare export { default as OrthographicView } from "@deck.gl/core/views/orthographic-view";

    declare export { default as Controller } from "@deck.gl/core/controllers/controller";

    declare export { default as MapController } from "@deck.gl/core/controllers/map-controller";

    declare export { default as FirstPersonController } from "@deck.gl/core/controllers/first-person-controller";

    declare export { default as OrbitController } from "@deck.gl/core/controllers/orbit-controller";

    declare export { default as OrthographicController } from "@deck.gl/core/controllers/orthographic-controller";

    declare export { default as Effect } from "@deck.gl/core/lib/effect";

    declare export { default as LayerExtension } from "@deck.gl/core/lib/layer-extension";

    declare export { TRANSITION_EVENTS } from "@deck.gl/core/controllers/transition-manager";

    declare export { default as LinearInterpolator } from "@deck.gl/core/transitions/linear-interpolator";

    declare export { default as FlyToInterpolator } from "@deck.gl/core/transitions/viewport-fly-to-interpolator";

    declare export { default as log } from "@deck.gl/core/utils/log";

    declare export { createIterable } from "@deck.gl/core/utils/iterable-utils";

    declare export { fp64LowPart } from "@deck.gl/core/utils/math-utils";

    declare export { default as Tesselator } from "@deck.gl/core/utils/tesselator";

    declare export {
      fillArray as _fillArray,
      flatten as _flatten,
    } from "@deck.gl/core/utils/flatten";

    declare export { count as _count } from "@deck.gl/core/utils/count";

    declare export { default as _memoize } from "@deck.gl/core/utils/memoize";

    declare export { mergeShaders as _mergeShaders } from "@deck.gl/core/utils/shader";

    declare export { compareProps as _compareProps } from "@deck.gl/core/lifecycle/props";

    declare export { RGBAColor } from "@deck.gl/core/utils/color";

    declare export {
      Position,
      Position2D,
      Position3D,
    } from "@deck.gl/core/utils/positions";
  }
