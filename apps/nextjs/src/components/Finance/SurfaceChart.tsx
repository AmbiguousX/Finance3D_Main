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

// Make sure to initialize WASM before any chart creation
// Ensure we're loading exact version matches from local files
const initSciChartWasm = () => {
    try {
        // For 3D charts
        SciChart3DSurface.configure({
            dataUrl: "/scichart3d.data",
            wasmUrl: "/scichart3d.wasm"
        });

        // For 2D charts (used by the legend)
        // Adding this separately to avoid interference with the 3D chart
        try {
            SciChartSurface.configure({
                dataUrl: "/scichart2d.data",
                wasmUrl: "/scichart2d.wasm"
            });
            console.log("2D WASM configuration complete");
        } catch (error2d) {
            console.error("Error configuring 2D SciChart WASM:", error2d);
        }

        // Initialize the license
        SciChartSurface.UseCommunityLicense();

        console.log("SciChart WASM configuration complete");
    } catch (error) {
        console.error("Error configuring SciChart WASM:", error);
    }
}

// Initialize immediately
initSciChartWasm();

// Drawing functions
export const drawExample = async (rootElement: string | HTMLDivElement) => {
    try {
        console.log("Starting to create SciChart3DSurface");

        // Create with empty options and handle potential errors
        const result = await SciChart3DSurface.create(rootElement, {});

        if (!result || !result.sciChart3DSurface || !result.wasmContext) {
            throw new Error("Failed to create SciChart3DSurface - missing components");
        }

        const { sciChart3DSurface, wasmContext } = result;
        console.log("SciChart3DSurface created successfully");

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
    } catch (error) {
        console.error("Error in drawExample:", error);
        throw error;
    }
};

export const drawHeatmapLegend = async (rootElement: string | HTMLDivElement) => {
    try {
        console.log("Starting to create HeatmapLegend");

        // Create with proper options and handle potential errors
        const result = await HeatmapLegend.create(rootElement, {
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

        if (!result || !result.heatmapLegend) {
            throw new Error("Failed to create HeatmapLegend - missing components");
        }

        console.log("HeatmapLegend created successfully");

        // Return the sciChartSurface from the legend
        try {
            return {
                sciChartSurface: result.heatmapLegend.innerSciChartSurface.sciChartSurface
            };
        } catch (e) {
            console.error("Error accessing legend properties:", e);
            throw new Error("Failed to access legend properties");
        }
    } catch (error) {
        console.error("Error in drawHeatmapLegend:", error);
        throw error;
    }
};

// REACT COMPONENT
export default function SurfaceMesh3DChart() {
    const chartRef = React.useRef<HTMLDivElement>(null);
    const legendRef = React.useRef<HTMLDivElement>(null);
    const [isLoading, setIsLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);
    const [chartInstance, setChartInstance] = React.useState<any>(null);
    const [legendInstance, setLegendInstance] = React.useState<any>(null);
    const [showLegend, setShowLegend] = React.useState(false);

    // Initialize license and load charts
    React.useEffect(() => {
        console.log("Component mounted, waiting for WASM initialization");
        let chart: any = null;

        // Load 3D chart first
        const timeout = setTimeout(async () => {
            try {
                // Initialize the chart if ref is available
                if (chartRef.current) {
                    console.log("Initializing 3D surface chart");
                    chart = await drawExample(chartRef.current);
                    setChartInstance(chart);
                    console.log("3D surface chart initialized successfully");

                    // Only attempt to load legend after chart is successful
                    setShowLegend(true);
                }

                // Set loading to false after the chart is loaded
                setIsLoading(false);
            } catch (err: unknown) {
                console.error("Failed to initialize chart:", err);
                setError(
                    err instanceof Error ? err.message : "Failed to load SciChart"
                );
                setIsLoading(false);
            }
        }, 1000); // Delay initialization by 1 second

        // Cleanup function
        return () => {
            clearTimeout(timeout);
            try {
                if (chart && chart.sciChartSurface) {
                    console.log("Cleaning up chart");
                    chart.sciChartSurface.delete();
                }
            } catch (e: unknown) {
                console.error("Error during chart cleanup:", e);
            }
        };
    }, []);

    // Effect to load the legend separately after the chart is loaded
    React.useEffect(() => {
        let legend: any = null;
        let legendTimeout: NodeJS.Timeout | null = null;

        if (showLegend && legendRef.current) {
            const loadLegend = async () => {
                try {
                    console.log("Initializing heatmap legend");
                    // Make sure legendRef.current is not null before passing it
                    if (legendRef.current) {
                        legend = await drawHeatmapLegend(legendRef.current);
                        setLegendInstance(legend);
                        console.log("Heatmap legend initialized successfully");
                    }
                } catch (legendError) {
                    console.error("Failed to initialize legend:", legendError);
                    // We don't show errors for legend failures, just log them
                }
            };

            // Delay legend initialization even more to ensure it doesn't interfere with chart
            legendTimeout = setTimeout(() => {
                loadLegend();
            }, 500);
        }

        return () => {
            if (legendTimeout) {
                clearTimeout(legendTimeout);
            }
            try {
                if (legend && legend.sciChartSurface) {
                    console.log("Cleaning up legend");
                    legend.sciChartSurface.delete();
                }
            } catch (e: unknown) {
                console.error("Error during legend cleanup:", e);
            }
        };
    }, [showLegend]);

    return (
        <div className="relative h-[400px] w-full">
            {isLoading && (
                <div style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "rgba(0,0,0,0.5)",
                    color: "white",
                    fontSize: "16px"
                }}>
                    Loading SciChart...
                </div>
            )}

            {error && (
                <div style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "rgba(255,0,0,0.1)",
                    color: "red",
                    padding: "20px",
                    textAlign: "center"
                }}>
                    Error: {error}
                </div>
            )}

            <div ref={chartRef} style={{ height: "100%", width: "100%" }} />
            {showLegend && (
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
            )}
        </div>
    );
}