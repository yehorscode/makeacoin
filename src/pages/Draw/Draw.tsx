import React from "react";
import { useState } from "react";
import { Stage, Layer, Image } from "react-konva";
import type { KonvaEventObject } from "konva/lib/Node";
import type { Image as KonvaImage } from "konva/lib/shapes/Image";
import type { Vector2d } from "konva/lib/types";
import { floodFill } from "./FloodFill";
// DISCLOSURE:
// AI was used while making the drawing page. The base code was made with a mix of the demo (https://konvajs.org/docs/sandbox/Free_Drawing.html) and my personal experimenting and ai!!!!
// also uhhh
// math is hard :sob:
// why dont they add emojis to comments when using this type of things (:sob: for example)
// that is actuaally a great idea that i can make into an extension
// alright i will start kinda commenting parts that i dont fully understand??
type Tool = "brush" | "eraser" | "fill";
type CoinFace = "front" | "back" | "ridge";
// default configs
const DEFAULT_STAGE_PADDING = 25;
const DEFAULT_LINE_WIDTH = 5;
const COIN_FACES: CoinFace[] = ["front", "back", "ridge"];
// most straightforward part of the code basicly just sets the line sizes
const configureContext = (context: CanvasRenderingContext2D, color: string, size: number) => {
    context.strokeStyle = color;
    context.lineJoin = "round";
    context.lineCap = "round";
    context.lineWidth = size;
};

const MIN_FACE_WIDTH = 240;
// the sides of the coin
const FACE_LABELS: Record<CoinFace, string> = {
    front: "Front",
    back: "Back",
    ridge: "Ridge",
};

// main func
export default function DrawPage() {
    // definitions of variables 
    const [tool, setTool] = React.useState<Tool>("brush");
    const [color, setColor] = useState("#FFD700");
    const [size, setSize] = useState(5);

    //states for different positions?
    // shows on which side user is drawing
    const isDrawingRefs = React.useRef<Record<CoinFace, boolean>>({
        front: false,
        back: false,
        ridge: false,
    });
    // last pos wher cusror was
    const lastPositions = React.useRef<Record<CoinFace, Vector2d | null>>({
        front: null,
        back: null,
        ridge: null,
    });
    // idfk what this is
    const [, forceRender] = React.useReducer((count: number) => count + 1, 0);
    const canvasesRef = React.useRef<Record<CoinFace, HTMLCanvasElement | null>>({
        front: null,
        back: null,
        ridge: null,
    });
    const contextsRef = React.useRef<Record<CoinFace, CanvasRenderingContext2D | null>>({
        front: null,
        back: null,
        ridge: null,
    });
    const imageRefs = React.useRef<Record<CoinFace, KonvaImage | null>>({
        front: null,
        back: null,
        ridge: null,
    });
    const containerRefs = React.useRef<Record<CoinFace, HTMLDivElement | null>>({
        front: null,
        back: null,
        ridge: null,
    });
    // how big the canvas is
    const [stageSize, setStageSize] = React.useState(() => ({
        width: typeof window !== "undefined" ? window.innerWidth : 0,
        height:
            typeof window !== "undefined"
                ? Math.max(window.innerHeight - DEFAULT_STAGE_PADDING, 0)
                : 0,
    }));
    const [faceSizes, setFaceSizes] = React.useState<
        Record<CoinFace, { width: number; height: number }>
    >({
        front: { width: 0, height: 0 },
        back: { width: 0, height: 0 },
        ridge: { width: 0, height: 0 },
    });

    const faceDimensions = React.useMemo(() => {
        const width = COIN_FACES.length
            ? Math.max(stageSize.width / COIN_FACES.length - DEFAULT_STAGE_PADDING, 0)
            : stageSize.width;

        return {
            width,
            height: stageSize.height,
        };
    }, [stageSize.height, stageSize.width]);

    // makes the canavs
    React.useEffect(() => {
        if (typeof document === "undefined") {
            return;
        }

        COIN_FACES.forEach((face) => {
            const canvas = document.createElement("canvas");
            const context = canvas.getContext("2d");

            if (!context) {
                console.error(`Failed to obtain 2D drawing context for ${face}.`);
                return;
            }

            canvas.width = stageSize.width;
            canvas.height = stageSize.height;
            configureContext(context, color, size);

            canvasesRef.current[face] = canvas;
            contextsRef.current[face] = context;
        });

        forceRender();

        return () => {
            COIN_FACES.forEach((face) => {
                canvasesRef.current[face] = null;
                contextsRef.current[face] = null;
            });
        };
    }, [forceRender]);

    // changes the size of the canvas when its resized?
    React.useEffect(() => {
        if (typeof window === "undefined") {
            return;
        }

        const updateSize = () => {
            setStageSize({
                width: window.innerWidth,
                height: Math.max(window.innerHeight - DEFAULT_STAGE_PADDING, 0),
            });
        };

        updateSize();
        window.addEventListener("resize", updateSize);

        return () => {
            window.removeEventListener("resize", updateSize);
        };
    }, []);

    //updating canva
    React.useEffect(() => {
        COIN_FACES.forEach((face) => {
            const canvas = canvasesRef.current[face];
            const context = contextsRef.current[face];

            if (!canvas || !context) {
                return;
            }

            const targetWidth = Math.max(
                faceSizes[face]?.width ?? faceDimensions.width,
                MIN_FACE_WIDTH
            );

            canvas.width = targetWidth;
            canvas.height = faceDimensions.height;
            configureContext(context, color, size);
            imageRefs.current[face]?.getLayer()?.batchDraw();
        });
    }, [faceDimensions.height, faceDimensions.width, faceSizes]);

    // handling brush size & colour
    React.useEffect(() => {
        COIN_FACES.forEach((face) => {
            const context = contextsRef.current[face];

            if (!context) {
                return;
            }

            configureContext(context, color, size);
        });
    }, [color, size]);

    React.useEffect(() => {
        setFaceSizes((previous) => {
            const next = { ...previous };
            let changed = false;

            COIN_FACES.forEach((face) => {
                const node = containerRefs.current[face];
                if (!node) {
                    return;
                }

                const measuredWidth = node.clientWidth;
                const measuredHeight = faceDimensions.height;

                if (
                    next[face]?.width !== measuredWidth ||
                    next[face]?.height !== measuredHeight
                ) {
                    next[face] = {
                        width: measuredWidth,
                        height: measuredHeight,
                    };
                    changed = true;
                }
            });

            return changed ? next : previous;
        });
    }, [faceDimensions.height, stageSize.height, stageSize.width]);


    // drawing
    const handlePointerDown = React.useCallback(
        (face: CoinFace, event: KonvaEventObject<MouseEvent | TouchEvent>) => {
            const stage = event.target.getStage();
            const pointerPosition = stage?.getPointerPosition();

            if (!pointerPosition) {
                return;
            }

            isDrawingRefs.current[face] = true;
            lastPositions.current[face] = pointerPosition;
        },
        []
    );
    // undrawing 
    const handlePointerUp = React.useCallback((face: CoinFace) => {
        isDrawingRefs.current[face] = false;
        lastPositions.current[face] = null;
    }, []);
    // drawing and moving
    const handlePointerMove = React.useCallback(
        (face: CoinFace, event: KonvaEventObject<MouseEvent | TouchEvent>) => {
            if (!isDrawingRefs.current[face]) {
                return;
            }

            const context = contextsRef.current[face];
            const image = imageRefs.current[face];
            const previousPos = lastPositions.current[face];

            if (!context || !image || !previousPos) {
                return;
            }

            const stage = event.target.getStage();
            const pointerPosition = stage?.getPointerPosition();

            if (!stage || !pointerPosition) {
                return;
            }

            if (tool === "fill") {
                if (!isDrawingRefs.current[face]) return; 
                const localPos = {
                    x: pointerPosition.x - image.x(),
                    y: pointerPosition.y - image.y(),
                };
                floodFill(context, Math.floor(localPos.x), Math.floor(localPos.y), color);
                image.getLayer()?.batchDraw();
                isDrawingRefs.current[face] = false; 
                return;
            }

            context.globalCompositeOperation =
                tool === "eraser" ? "destination-out" : "source-over";
            context.beginPath();

            const localPrev = {
                x: previousPos.x - image.x(),
                y: previousPos.y - image.y(),
            };
            context.moveTo(localPrev.x, localPrev.y);

            const localNext = {
                x: pointerPosition.x - image.x(),
                y: pointerPosition.y - image.y(),
            };
            context.lineTo(localNext.x, localNext.y);
            context.closePath();
            context.stroke();

            lastPositions.current[face] = pointerPosition;
            image.getLayer()?.batchDraw();
        },
        [tool, color]
    );
    // changing tools (brush fill etc)
    const handleToolChange = React.useCallback(
        (event: React.ChangeEvent<HTMLSelectElement>) => {
            setTool(event.target.value as Tool);
        },
        []
    );
    // clearing stage
    const handleClearFace = React.useCallback((face: CoinFace) => {
        const context = contextsRef.current[face];
        const canvas = canvasesRef.current[face];

        if (!context || !canvas) {
            return;
        }

        context.clearRect(0, 0, canvas.width, canvas.height);
        configureContext(context, color, size);
        imageRefs.current[face]?.getLayer()?.batchDraw();
    }, []);
    // everyone knows this lmao
    return ( 
        <div className="flex flex-col gap-[25px] p-[25px]">
                        <div className="flex gap-[25px]">
                <label className="flex items-center gap-2">
                    <span>Tool:</span>
                    <select value={tool} onChange={handleToolChange}>
                        <option value="brush">Brush</option>
                        <option value="eraser">Eraser</option>
                        <option value="fill">Fill</option>
                    </select>
                </label>
                <label className="flex items-center gap-2">
                    <span>Color:</span>
                    <input type="color" value={color} onChange={(e) => setColor(e.target.value)} />
                </label>
                <label className="flex items-center gap-2">
                    <span>Size:</span>
                    <input type="range" min="1" max="20" value={size} onChange={(e) => setSize(Number(e.target.value))} />
                </label>
            </div>
            <div className="flex flex-wrap gap-[25px]">
                {COIN_FACES.map((face) => (
                    <div
                        key={face}
                        ref={(node) => {
                            containerRefs.current[face] = node;
                        }}
                        className="flex-1 min-w-[240px] flex flex-col gap-3"
                    >
                        <div className="font-semibold uppercase tracking-wider">
                            {FACE_LABELS[face]}
                        </div>
                        <button
                            type="button"
                            onClick={() => handleClearFace(face)}
                            className="self-start px-2.5 py-1 rounded-md border border-gray-300 bg-transparent cursor-pointer"
                        >
                            Clear
                        </button>
                        <Stage
                            width={Math.max(
                                faceSizes[face]?.width ?? faceDimensions.width,
                                MIN_FACE_WIDTH
                            )}
                            height={faceDimensions.height}
                            onMouseDown={(event) => handlePointerDown(face, event)}
                            onMouseMove={(event) => handlePointerMove(face, event)}
                            onMouseUp={() => handlePointerUp(face)}
                            onMouseLeave={() => handlePointerUp(face)}
                            onTouchStart={(event) => handlePointerDown(face, event)}
                            onTouchMove={(event) => handlePointerMove(face, event)}
                            onTouchEnd={() => handlePointerUp(face)}
                            onTouchCancel={() => handlePointerUp(face)}
                        >
                            <Layer>
                                <Image
                                    ref={(node) => {
                                        imageRefs.current[face] = node;
                                    }}
                                    image={canvasesRef.current[face] ?? undefined}
                                    x={0}
                                    y={0}
                                />
                            </Layer>
                        </Stage>
                    </div>
                ))}
            </div>
        </div>
    );
}
