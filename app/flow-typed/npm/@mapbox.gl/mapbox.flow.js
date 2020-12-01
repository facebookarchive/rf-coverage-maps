/**
 * Flowtype definitions for index
 * Generated by Flowgen from a Typescript Definition
 * Flowgen v1.11.0
 * @flow
 */

declare module "@deck.gl/mapbox/deck-utils" {
  declare export function getDeckInstance(x: {
    map: any,
    gl: any,
    deck: any,
    ...
  }): any;

  declare export function addLayer(deck: any, layer: any): void;

  declare export function removeLayer(deck: any, layer: any): void;

  declare export function updateLayer(deck: any, layer: any): void;

  declare export function drawLayer(deck: any, map: any, layer: any): void;
}

declare module "@deck.gl/mapbox/mapbox-layer" {
  import type { Deck, Layer } from "deck.gl";

  import type { LayerProps } from "@deck.gl/core/lib/layer";

  declare export type RenderingMode = "2d" | "3d";
  declare export type MapboxLayerProps<D> = {
    id: string,
    deck?: Deck,
    renderingMode?: RenderingMode,
    type?: typeof Layer,
    ...
  } & LayerProps<D>;

  declare export default class MapboxLayer<D> {
    constructor(props: MapboxLayerProps<D>): this;
    id: string;
    type: "custom";
    renderingMode: RenderingMode;
    map: any;
    deck: Deck;
    props: MapboxLayerProps<D>;
    onAdd(map: any, gl: any): void;
    onRemove(): void;
    setProps(props: any): void;
    render(gl: any, matrix: any): void;
  }
}

declare module "@deck.gl/mapbox" {
  declare export { default as MapboxLayer } from "@deck.gl/mapbox/mapbox-layer";
}
