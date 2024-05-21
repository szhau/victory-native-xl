import React, { useMemo } from "react";
import {
  Line,
  Path,
  Skia,
  Text,
  vec,
  type Color,   Canvas,  Group, type SkFont,
} from "@shopify/react-native-skia";
import { StyleSheet } from "react-native";
import type {
  ValueOf,
  NumericalFields,
  InputDatum,
  AxisProps,
  InputFields,
} from "../../types";



interface RotatedTextProps {
  radian:number;
  text: string;
  x: number;
  y: number;
  font: SkFont; // Adjust this type according to the actual type from Skia
  color: Color;
}

const RotatedText: React.FC<RotatedTextProps> = ({radian, text, x, y, font, color }) => {
  return (
    <Group transform={[{ rotate: radian }]} origin={{ x: x, y: y }}>
      <Text x={x} y={y} text={text} font={font} color={color} />
    </Group>
  );
};


export const CartesianAxis = <
  RawData extends Record<string, unknown>,
  XK extends keyof InputFields<RawData>,
  YK extends keyof NumericalFields<RawData>,
  YRK extends keyof NumericalFields<RawData>
>({
  tickCount,
  labelPosition,
  labelOffset,
  axisSide,
  lineColor,
  lineWidth,
  labelColor,
  formatYLabel,
  formatXLabel,
  yScale,
  xScale,
  yrScale,
  font,
  isNumericalData = false,
  ix,
  label,
}: AxisProps<RawData, XK, YK, YRK>) => {

  const axisConfiguration = useMemo(() => {
    return {
      xTicks: typeof tickCount === "number" ? tickCount : tickCount.x,
      yTicks: typeof tickCount === "number" ? tickCount : tickCount.y,
      xLabelOffset:
        typeof labelOffset === "number" ? labelOffset : labelOffset.x,
      yLabelOffset:
        typeof labelOffset === "number" ? labelOffset : labelOffset.y,
      xAxisPosition: axisSide.x,
      yAxisPosition: axisSide.y,
      xLabelPosition:
        typeof labelPosition === "string" ? labelPosition : labelPosition.x,
      yLabelPosition:
        typeof labelPosition === "string" ? labelPosition : labelPosition.y,
      gridXLineColor: (typeof lineColor === "object" && "grid" in lineColor
        ? typeof lineColor.grid === "object" && "x" in lineColor.grid
          ? lineColor.grid.x
          : lineColor.grid
        : lineColor) as Color,
      gridYLineColor: (typeof lineColor === "object" && "grid" in lineColor
        ? typeof lineColor.grid === "object" && "y" in lineColor.grid
          ? lineColor.grid.y
          : lineColor.grid
        : lineColor) as Color,
      gridFrameLineColor: (typeof lineColor === "object" && "frame" in lineColor
        ? lineColor.frame
        : lineColor) as Color,
      gridXLineWidth:
        typeof lineWidth === "object" && "grid" in lineWidth
          ? typeof lineWidth.grid === "object" && "x" in lineWidth.grid
            ? lineWidth.grid.x
            : lineWidth.grid
          : lineWidth,
      gridYLineWidth:
        typeof lineWidth === "object" && "grid" in lineWidth
          ? typeof lineWidth.grid === "object" && "y" in lineWidth.grid
            ? lineWidth.grid.y
            : lineWidth.grid
          : lineWidth,
      gridFrameLineWidth:
        typeof lineWidth === "object" && "frame" in lineWidth
          ? lineWidth.frame
          : lineWidth,
    } as const;
  }, [
    tickCount,
    labelOffset,
    axisSide.x,
    axisSide.y,
    labelPosition,
    lineColor,
    lineWidth,
  ]);

  const {
    xTicks,
    yTicks,
    xAxisPosition,
    yAxisPosition,
    xLabelPosition,
    yLabelPosition,
    xLabelOffset,
    yLabelOffset,
    gridXLineColor,
    gridYLineColor,
    gridFrameLineColor,
    gridXLineWidth,
    gridYLineWidth,
    gridFrameLineWidth,
  } = axisConfiguration;

  const [x1 = 0, x2 = 0] = xScale.domain();
  const [y1 = 0, y2 = 0] = yScale.domain();
  const [y1r = 0, y2r = 0] = yrScale.domain();
  const [x1r = 0, x2r = 0] = xScale.range();
  const fontSize = font?.getSize() ?? 0;


  // Calculate the positions for the axis labels, Lai added
  const xAxisLabel = useMemo(() => {
    if (!label?.x) return null;
    const midPoint = (xScale.range()[0] + xScale.range()[1]) / 2;
    const yPos =  yScale(y2) + 40 ; // Adjust 30 based on your styling needs
    return { x: midPoint-20, y: yPos, text: label.x };
  }, [label, xScale, yScale, xAxisPosition, y1, y2]);

  const yAxisLabel = useMemo(() => {
    if (!label?.yl) return null;
    const midPoint = (yScale.range()[0] + yScale.range()[1]) / 2+20;
    //const xPos = yAxisPosition === "left" ? 10  : xScale(x2) + 20;
    const xPos =  10  ; // Adjust 60 and 20 based on your styling needs
    return { x: xPos, y: midPoint, text: label?.yl, color: labelColor.yl };
  }, [label, xScale, yScale,  x1, x2]);

  const yrAxisLabels = useMemo(() => {
    if (!Array.isArray(label?.yr)) return [];
    
    return label.yr.map((yrLabel, index) => {
      const midPoint = (yrScale.range()[0] + yrScale.range()[1]) / 2 + 20;
      const xPos = xScale(x2) + 20 + (index * 20); // Adjust spacing as needed
      console.log("xy,",xPos,midPoint );
      return { x: xPos, y: midPoint, text: yrLabel, color: labelColor.yr };
    });
  }, [label, xScale, yrScale, x1, x2]);


  const yAxisNodes = yScale.ticks(yTicks).map((tick) => {
    const contentY = formatYLabel(tick as never);
    const labelWidth = font?.getTextWidth?.(contentY) ?? 0;
    const labelY = yScale(tick) + fontSize / 3;
    const labelX = (() => {
      // left, outset      
      console.log("labelX left",xScale(x1) - (labelWidth + yLabelOffset), labelY, yScale(tick),tick);
        return xScale(x1) - (labelWidth + yLabelOffset);     
     
    })();

    return (
      <React.Fragment key={`y-tick-${tick}`}>
        <Line
          p1={vec(xScale(x1), yScale(tick))}
          p2={vec(xScale(x2), yScale(tick))}
          color={gridYLineColor}
          strokeWidth={gridYLineWidth}
        />
        {font
          ?  (
              <Text
                color={
                  typeof labelColor === "string" ? labelColor : labelColor.yl
                }
                text={contentY}
                font={font}
                y={labelY}
                x={labelX}
              />
            )
          : null}
      </React.Fragment>
    );
  });

  

  const rightYAxisNodes = yrScale.ticks( yScale.ticks(yTicks).length ).map((tick) => {
    const contentY = formatYLabel(tick as never);
    const labelWidth = font?.getTextWidth?.(contentY) ?? 0;
    const labelY = yrScale( tick ) + fontSize / 3;    

    const labelX = (() => {
      // left, outset      
      console.log("labely right", labelY, yScale.ticks(yTicks).length ,tick);
        return xScale(x2) + (labelWidth - yLabelOffset);    
    })();
   

    return (
      <React.Fragment key={`yr-tick-${tick}`}>
        
        {font
          ? (
              <Text
                color={
                  typeof labelColor === "string" ? labelColor : labelColor.yr
                }
                text={contentY}
                font={font}
                y={labelY}
                x={labelX}
              />
            )
          : null}
      </React.Fragment>
    );
  });

  const xAxisNodes = xScale.ticks(xTicks).map((tick) => {
    const val = isNumericalData ? tick : ix[tick];
    const contentX = formatXLabel(val as never);
    const labelWidth = font?.getTextWidth?.(contentX) ?? 0;
    const labelX = xScale(tick) - (labelWidth ?? 0) / 2;
    const canFitLabelContent =
      yAxisPosition === "left" ? labelX + labelWidth < x2r : x1r < labelX;

    const labelY = (() => {
      // bottom, outset
      if (xAxisPosition === "bottom" && xLabelPosition === "outset") {
        return yScale(y2) + xLabelOffset + fontSize-5;
      }
      // bottom, inset
      if (xAxisPosition === "bottom" && xLabelPosition === "inset") {
        return yScale(y2) - xLabelOffset;
      }
      // top, outset
      if (xAxisPosition === "top" && xLabelPosition === "outset") {
        return yScale(y1) - xLabelOffset;
      }
      // top, inset
      return yScale(y1) + fontSize + xLabelOffset;
    })();

    return (
      <React.Fragment key={`x-tick-${tick}`}>
        <Line
          p1={vec(xScale(tick), yScale(y2))}
          p2={vec(xScale(tick), yScale(y1))}
          color={gridXLineColor}
          strokeWidth={gridXLineWidth}
        />
        {font && labelWidth && canFitLabelContent ? (
          <Text
            color={typeof labelColor === "string" ? labelColor : labelColor.x}
            text={contentX}
            font={font}
            y={labelY}
            x={labelX}
          />
        ) : null}
      </React.Fragment>
    );
  });

  const boundingFrame = React.useMemo(() => {
    const framePath = Skia.Path.Make();

    framePath.addRect(
      Skia.XYWHRect(
        xScale(x1),
        yScale(y1),
        xScale(x2) - xScale(x1),
        yScale(y2) - yScale(y1),
      ),
    );
    return framePath;
  }, [x1, x2, xScale, y1, y2, yScale]);

  return (
    <>
      {xTicks > 0 ? xAxisNodes : null}
      {yTicks > 0 ? yAxisNodes : null}
      {yTicks > 0 ? rightYAxisNodes : null}
      {xTicks > 0 && xAxisLabel && (
        <Text
          text={xAxisLabel.text}
          x={xAxisLabel.x}
          y={xAxisLabel.y}
          color={labelColor.x || "#000"}
          font={font}
        />
      )}
      {yTicks > 0 && yAxisLabel && (
         <RotatedText
            radian={-Math.PI / 2}
            text={yAxisLabel.text}
            x={yAxisLabel.x}
            y={yAxisLabel.y}
            font={font} 
            color={yAxisLabel.color}
          />
        
      )} 
      {yTicks > 0 && yrAxisLabels.map((yrAxisLabel, index) => (
         <RotatedText
            radian={Math.PI / 2}
            key={`yr-label-${index}`}
            text={yrAxisLabel.text}
            x={yrAxisLabel.x+10}
            y={yrAxisLabel.y-50}
            font={font} 
            color={yrAxisLabel.color}
          />
      ))}
      
      <Path
        path={boundingFrame}
        strokeWidth={gridFrameLineWidth}
        style="stroke"
        color={gridFrameLineColor}
      />
    </>
  );
};

CartesianAxis.defaultProps = {
  lineColor: "hsla(0, 0%, 0%, 0.25)",
  lineWidth: StyleSheet.hairlineWidth,
  tickCount: 5,
  labelOffset: { x: 2, y: 4 },
  axisSide: { x: "bottom", y: "left" },
  labelPosition: "outset",
  formatXLabel: (label: ValueOf<InputDatum>) => String(label),
  formatYLabel: (label: ValueOf<InputDatum>) => String(label),
  labelColor: "#000000",
  ix: [],
} satisfies Partial<AxisProps<never, never, never, never>>;
