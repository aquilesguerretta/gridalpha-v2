import { FlyToInterpolator } from '@deck.gl/core';

interface ViewState {
  longitude: number;
  latitude: number;
  zoom: number;
  pitch: number;
  bearing: number;
  transitionDuration?: number;
  transitionInterpolator?: any;
  transitionEasing?: (t: number) => number;
}

const quinticOut = (t: number) => 1 - Math.pow(1 - t, 5);

export const swoopNavigation = (
  _start: ViewState,
  end: ViewState,
  duration: number = 2000
): ViewState => {
  return {
    ...end,
    transitionDuration: duration,
    transitionInterpolator: new FlyToInterpolator({ speed: 1.2 }),
    transitionEasing: quinticOut,
    pitch: 45, // Tactical angle for GridAlpha
    bearing: end.bearing || 0
  };
};

export const getParabolicPath = (t: number, startHeight: number, peakHeight: number) => {
  // Simple parabolic arc for camera altitude adjustment during swoop
  return startHeight + (peakHeight - startHeight) * (1 - Math.pow(2 * t - 1, 2));
};