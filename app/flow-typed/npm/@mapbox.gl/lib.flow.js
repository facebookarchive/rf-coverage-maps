
declare module "lib" {
    declare export { COORDINATE_SYSTEM } from "@deck.gl/core/lib/constants";

    declare export { default as Deck } from "@deck.gl/core/lib/deck";

    declare export { default as DeckRenderer } from "@deck.gl/core/lib/deck-renderer";

    declare export { default as Effect } from "@deck.gl/core/lib/effect";

    declare export { default as Layer } from "@deck.gl/core/lib/layer";

    declare export { default as CompositeLayer } from "@deck.gl/core/lib/composite-layer";

    declare export { default as LayerExtension } from "@deck.gl/core/lib/layer-extension";

    declare export { default as AttributeManager } from "@deck.gl/core/lib/attribute/attribute-manager";

    declare export { default as LayerManager } from "@deck.gl/core/lib/layer-manager";
  }