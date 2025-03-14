'use client';

import * as React from "react";
import {
    CameraController,
    EDrawMeshAs,
    GradientColorPalette,
    HeatmapLegend,
    MouseWheelZoomModifier3D,
    NumberRange,
    NumericAxis3D,
    OrbitModifier3D,
    ResetCamera3DModifier,
    SciChart3DSurface,
    SurfaceMeshRenderableSeries3D,
    TooltipModifier3D,
    UniformGridDataSeries3D,
    Vector3,
    SciChartSurface
} from "scichart";

// Set the WASM location before any chart initializations
// This is fine outside of components because it's not a hook


// Drawing functions
export const drawExample = async (rootElement: string | HTMLDivElement) => {
    // Create a SciChart3DSurface
    const { sciChart3DSurface, wasmContext } = await SciChart3DSurface.create(rootElement, {});

    // Create and position the camera in the 3D world
    sciChart3DSurface.camera = new CameraController(wasmContext, {
        position: new Vector3(-200, 150, 200),
        target: new Vector3(0, 50, 0),
    });
    // Set the worlddimensions, which defines the Axis cube size
    sciChart3DSurface.worldDimensions = new Vector3(200, 100, 200);

    // Add an X,Y and Z Axis
    sciChart3DSurface.xAxis = new NumericAxis3D(wasmContext, { axisTitle: "X Axis" });
    sciChart3DSurface.yAxis = new NumericAxis3D(wasmContext, {
        axisTitle: "Y Axis",
        visibleRange: new NumberRange(0, 0.3),
    });
    sciChart3DSurface.zAxis = new NumericAxis3D(wasmContext, { axisTitle: "Z Axis" });

    // Create a 2D array with robust initialization and fill with data
    const zSize = 25;
    const xSize = 25;
    const heightmapArray: number[][] = Array(zSize).fill(null).map((_, z) =>
        Array(xSize).fill(0).map((_, x) => {
            const xVal = (x / xSize) * 25.0;
            const zVal = (z / zSize) * 25.0;
            return Math.sin(xVal * 0.2) / ((zVal + 1) * 2);
        })
    );

    // Create a UniformGridDataSeries3D
    const dataSeries = new UniformGridDataSeries3D(wasmContext, {
        yValues: heightmapArray,
        xStep: 1,
        zStep: 1,
        dataSeriesName: "Uniform Surface Mesh",
    });

    // Create the color map
    const colorMap = new GradientColorPalette(wasmContext, {
        gradientStops: [
            { offset: 1, color: "#FF69B4" },      // Vivid Pink
            { offset: 0.9, color: "#FFA500" },    // Vivid Orange
            { offset: 0.7, color: "#CD5C5C" },    // Muted Red
            { offset: 0.5, color: "#32CD32" },    // Vivid Green
            { offset: 0.3, color: "#87CEEB" },    // Vivid Sky Blue
            { offset: 0.15, color: "#4B0082" },   // Indigo
            { offset: 0, color: "#191970" },      // Dark Indigo
        ],
    });

    // Finally, create a SurfaceMeshRenderableSeries3D and add to the chart
    const series = new SurfaceMeshRenderableSeries3D(wasmContext, {
        dataSeries,
        minimum: 0,
        maximum: 0.5,
        opacity: 0.9,
        cellHardnessFactor: 1.0,
        shininess: 0,
        lightingFactor: 0.0,
        highlight: 1.0,
        stroke: "#0000FF",              // Vivid Blue
        strokeThickness: 2.0,
        contourStroke: "#0000FF",        // Vivid Blue
        contourInterval: 2,
        contourOffset: 0,
        contourStrokeThickness: 2,
        drawSkirt: false,
        drawMeshAs: EDrawMeshAs.SOLID_WIREFRAME,
        meshColorPalette: colorMap,
        isVisible: true,
    });

    sciChart3DSurface.renderableSeries.add(series);

    // Optional: Add some interactivity modifiers
    sciChart3DSurface.chartModifiers.add(new MouseWheelZoomModifier3D());
    sciChart3DSurface.chartModifiers.add(new OrbitModifier3D());
    sciChart3DSurface.chartModifiers.add(new ResetCamera3DModifier());
    sciChart3DSurface.chartModifiers.add(new TooltipModifier3D({
        tooltipContainerBackground: "#87CEFA"  // Pale Blue 
    }));

    return { sciChartSurface: sciChart3DSurface, wasmContext };
};

export const drawHeatmapLegend = async (rootElement: string | HTMLDivElement) => {
    const { heatmapLegend, wasmContext } = await HeatmapLegend.create(rootElement, {
        yAxisOptions: {
            isInnerAxis: true,
            labelStyle: {
                fontSize: 12,
                color: "#FFFFFF",
            },
            axisBorder: {
                borderRight: 1,
                color: "#FFFFFF77",
            },
            majorTickLineStyle: {
                color: "#FFFFFF",
                tickSize: 6,
                strokeThickness: 1,
            },
            minorTickLineStyle: {
                color: "#FFFFFF",
                tickSize: 3,
                strokeThickness: 1,
            },
        },
        colorMap: {
            minimum: 0,
            maximum: 0.5,
            gradientStops: [
                { offset: 1, color: "#FF69B4" },
                { offset: 0.9, color: "#FFA500" },
                { offset: 0.7, color: "#CD5C5C" },
                { offset: 0.5, color: "#32CD32" },
                { offset: 0.3, color: "#87CEEB" },
                { offset: 0.15, color: "#4B0082" },
                { offset: 0, color: "#191970" },
            ],
        },
    });

    return { sciChartSurface: heatmapLegend.innerSciChartSurface.sciChartSurface };
};

// REACT COMPONENT
export default function SurfaceMesh3DChart() {
    const chartRef = React.useRef<HTMLDivElement>(null);
    const legendRef = React.useRef<HTMLDivElement>(null);
    const [chart, setChart] = React.useState<any>(null);
    const [legend, setLegend] = React.useState<any>(null);

    // Initialize license when component mounts
    React.useEffect(() => {
        // This is the correct place to call UseCommunityLicense
        SciChartSurface.UseCommunityLicense();
    }, []);

    React.useEffect(() => {
        // Initialize chart and legend when component mounts
        if (chartRef.current && !chart) {
            drawExample(chartRef.current).then(result => {
                setChart(result);
            }).catch(error => {
                console.error("Failed to initialize chart:", error);
            });
        }

        if (legendRef.current && !legend) {
            drawHeatmapLegend(legendRef.current).then(result => {
                setLegend(result);
            }).catch(error => {
                console.error("Failed to initialize legend:", error);
            });
        }

        // Cleanup when component unmounts
        return () => {
            if (chart?.sciChartSurface) {
                chart.sciChartSurface.delete();
            }
            if (legend?.sciChartSurface) {
                legend.sciChartSurface.delete();
            }
        };
    }, [chart, legend]);

    return (
        <div className="relative h-[400px] w-full">
            <div ref={chartRef} style={{ height: "100%", width: "100%" }} />
            <div
                ref={legendRef}
                style={{
                    position: "absolute",
                    height: "100%",
                    width: "65px",
                    top: "0px",
                    right: "0px"
                }}
            />
        </div>
    );
}