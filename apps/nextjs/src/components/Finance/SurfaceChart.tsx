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
    zeroArray2D
} from "scichart";



export const drawExample = async (rootElement: string | HTMLDivElement) => {
    // Null check for rootElement
    if (!rootElement) {
        throw new Error('Root element is required');
    }

    // Create a SciChart3DSurface
    const { sciChart3DSurface, wasmContext } = await SciChart3DSurface.create(rootElement, {

    });

    // Null checks for critical objects
    if (!sciChart3DSurface || !wasmContext) {
        throw new Error('Failed to create SciChart3DSurface');
    }

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

    // Create a 2D array with robust initialization
    const zSize = 25;
    const xSize = 25;
    const heightmapArray: number[][] = Array(zSize).fill(null).map(() =>
        Array(xSize).fill(0)
    );


    // Ensure the array is not empty


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

    // Null check for dataSeries and colorMap
    if (!dataSeries || !colorMap) {
        throw new Error('Failed to create data series or color map');
    }

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

    // Null check for series
    if (!series) {
        throw new Error('Failed to create surface mesh series');
    }

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
    // Null check for rootElement
    if (!rootElement) {
        throw new Error('Root element is required');
    }

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

    // Null check for heatmapLegend and its surface
    if (!heatmapLegend || !heatmapLegend.innerSciChartSurface) {
        throw new Error('Failed to create heatmap legend');
    }

    return { sciChartSurface: heatmapLegend.innerSciChartSurface.sciChartSurface };
};