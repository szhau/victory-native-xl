import * as React from "react";
import {
  makeMutable,
  runOnJS,
  type SharedValue,
  useAnimatedReaction,
} from "react-native-reanimated";
import type { InputFieldType } from "../../types";

export const useChartPressState = <Init extends ChartPressStateInit>(
  initialValues: Init,
): { state: ChartPressState<Init>; isActive: boolean } => {
  const yKeys = Object.keys(initialValues.y).join(",");
  const yrKeys = Object.keys(initialValues.yr).join(",");

  const state = React.useMemo(() => {
    return {
      isActive: makeMutable(false),
      x: { value: makeMutable(initialValues.x), position: makeMutable(0) },
      y: Object.entries(initialValues.y).reduce(
        (acc, [key, initVal]) => {
          acc[key as keyof Init["y"]] = {
            value: makeMutable(initVal),
            position: makeMutable(0),
          };
          return acc;
        },
        {} as Record<
          keyof Init["y"],
          { value: SharedValue<number>; position: SharedValue<number> }
        >,
      ),
      yr: Object.entries(initialValues.yr).reduce(
        (acc, [key, initVal]) => {
          acc[key as keyof Init["yr"]] = {
            value: makeMutable(initVal),
            position: makeMutable(0),
          };
          return acc;
        },
        {} as Record<
          keyof Init["yr"],
          { value: SharedValue<number>; position: SharedValue<number> }
        >,
      ),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [yKeys, yrKeys]);

  const isActive = useIsPressActive(state);

  return { state, isActive };
};

type ChartPressStateInit = { 
  x: InputFieldType; 
  y: Record<string, number>; 
  yr: Record<string, number>; 
};

export type ChartPressState<Init extends ChartPressStateInit> = {
  isActive: SharedValue<boolean>;
  x: { value: SharedValue<Init["x"]>; position: SharedValue<number> };
  y: Record<
    keyof Init["y"],
    { value: SharedValue<number>; position: SharedValue<number> }
  >;
  yr: Record<
    keyof Init["yr"],
    { value: SharedValue<number>; position: SharedValue<number> }
  >;
};

const useIsPressActive = <Init extends ChartPressStateInit>(
  value: ChartPressState<Init>,
) => {
  const [isPressActive, setIsPressActive] = React.useState(
    () => value.isActive.value,
  );

  useAnimatedReaction(
    () => value.isActive.value,
    (val, oldVal) => {
      if (val !== oldVal) runOnJS(setIsPressActive)(val);
    },
  );

  return isPressActive;
};
