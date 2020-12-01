/**
 * Flowtype definitions for index
 * Generated by Flowgen from a Typescript Definition
 * Flowgen v1.11.0
 */

declare module "@deck.gl/react/utils/inherits-from" {
  declare export function inheritsFrom(Type: any, ParentType: any): boolean;
}

declare module "@deck.gl/react/utils/extract-jsx-layers" {
  declare export default function extractJSXLayers(x: {
    children: any,
    layers: any,
    views: any,
    ...
  }): {
    layers: any,
    children: any[],
    views: any,
    ...
  };
}

declare module "@deck.gl/react/utils/evaluate-children" {
  declare export default function evaluateChildren(
    children: any,
    childProps: any
  ): any;
}

declare module "@deck.gl/react/utils/position-children-under-views" {
  import type { ReactElement } from "react";

  declare export default function positionChildrenUnderViews(x: {
    children: any,
    viewports: any,
    deck: any,
    ContextProvider: any,
    ...
  }): ReactElement[];
}

declare module "@deck.gl/react/utils/extract-styles" {
  declare export default function extractStyles(x: {
    width: any,
    height: any,
    style: any,
    ...
  }): {
    containerStyle: {
      position: string,
      zIndex: number,
      left: number,
      top: number,
      width: any,
      height: any,
      ...
    },
    canvasStyle: {
      left: number,
      top: number,
      ...
    },
    ...
  };
}

declare module "@deck.gl/react/deckgl" {
  import type { DeckProps } from "@deck.gl/core/lib/deck";

  declare type propsNowOptional = "width" | "height" | "effects" | "layers";
  declare export type DeckGLProps = Omit<DeckProps, propsNowOptional> &
    $Rest<Pick<DeckProps, propsNowOptional>, { ... }>;
  import type { ReactElement } from "react";

  declare export default class DeckGL mixins React$Component<DeckGLProps> {
    constructor(props: DeckGLProps): this;
    componentDidMount(): void;
    shouldComponentUpdate(nextProps: any): boolean;
    componentDidUpdate(): void;
    componentWillUnmount(): void;
    pickObject(opts: any): any;
    pickMultipleObjects(opts: any): any;
    pickObjects(opts: any): any;
    _redrawDeck(): void;
    _customRender(redrawReason: any): void;
    _parseJSX(props: any): any;
    _updateFromProps(props: any): void;
    render(): ReactElement;
  }
}

declare module "@deck.gl/react" {
  declare export { default as DeckGL } from "@deck.gl/react/deckgl";

  declare export { default } from "@deck.gl/react/deckgl";
}