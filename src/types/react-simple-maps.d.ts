declare module 'react-simple-maps' {
  import { ComponentType, ReactNode, MouseEvent } from 'react';

  export interface ComposableMapProps {
    projection?: string;
    projectionConfig?: Record<string, any>;
    width?: number;
    height?: number;
    style?: React.CSSProperties;
    className?: string;
    children?: ReactNode;
  }

  export interface ZoomableGroupProps {
    zoom?: number;
    center?: [number, number];
    minZoom?: number;
    maxZoom?: number;
    children?: ReactNode;
    onMoveEnd?: (pos: { coordinates: [number, number]; zoom: number }) => void;
  }

  export interface GeographiesProps {
    geography: string | object;
    children: (props: { geographies: any[]; projection: any }) => ReactNode;
    parseGeographies?: (features: any[]) => any[];
  }

  export interface GeographyProps {
    geography: any;
    projection?: any;
    style?: {
      default?: React.CSSProperties;
      hover?: React.CSSProperties;
      pressed?: React.CSSProperties;
    };
    onClick?: (geo: any, evt: MouseEvent) => void;
    onMouseEnter?: (evt: MouseEvent) => void;
    onMouseLeave?: (evt: MouseEvent) => void;
    onMouseMove?: (evt: MouseEvent) => void;
    fill?: string;
    stroke?: string;
    strokeWidth?: number;
    className?: string;
  }

  export const ComposableMap: ComponentType<ComposableMapProps>;
  export const ZoomableGroup: ComponentType<ZoomableGroupProps>;
  export const Geographies: ComponentType<GeographiesProps>;
  export const Geography: ComponentType<GeographyProps>;
  export const Marker: ComponentType<any>;
  export const Annotation: ComponentType<any>;
  export const Graticule: ComponentType<any>;
  export const Sphere: ComponentType<any>;
}
