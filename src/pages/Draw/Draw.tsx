import React from "react";
import { useState } from "react";
import { Stage, Layer, Image } from "react-konva";
import type { KonvaEventObject } from "konva/lib/Node";
import type { Image as KonvaImage } from "konva/lib/shapes/Image";
import type { Vector2d } from "konva/lib/types";
import { floodFill } from "./FloodFill";
import { storage, coin_bucket } from "@/components/appwrite";
import { getUserID } from "@/components/appwrite";
import { ID, Permission, Role } from "appwrite";

// DISCLOSURE:
// AI was used while making the drawing page. The base code was made with a mix of the demo (https://konvajs.org/docs/sandbox/Free_Drawing.html) and my personal experimenting and ai!!!!
// also uhhh
// math is hard :sob:
// why dont they add emojis to comments when using this type of things (:sob: for example)
// that is actuaally a great idea that i can make into an extension
// alright i will start kinda commenting parts that i dont fully understand??

type Tool = "brush" | "eraser" | "fill";
type CoinFace = "front" | "back";
// default configs
const DEFAULT_STAGE_PADDING = 25;
const COIN_FACES: CoinFace[] = ["front", "back"];
// most straightforward part of the code basicly just sets the line sizes
const configureContext = (
    context: CanvasRenderingContext2D,
    color: string,
    size: number
) => {
    context.strokeStyle = color;
    context.lineJoin = "round";
    context.lineCap = "round";
    context.lineWidth = size;
};
// sets the golden background
const setBackground = (
    context: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement
) => {
    context.fillStyle = "#FFD700";
    context.fillRect(0, 0, canvas.width, canvas.height);
};
// the sides of the coin
const FACE_LABELS: Record<CoinFace, string> = {
    front: "Front",
    back: "Back",
};

// main func
export default function DrawPage() {
    // definitions of variables
    const [tool, setTool] = React.useState<Tool>("brush");
    const [color, setColor] = useState("#FFD700");
    const [size, setSize] = useState(5);
    const [currentFace, setCurrentFace] = useState<CoinFace>("front");
    const [undoStacks, setUndoStacks] = useState<Record<CoinFace, ImageData[]>>(
        {
            front: [],
            back: [],
        }
    );

    //states for different positions?
    // shows on which side user is drawing
    const isDrawingRefs = React.useRef<Record<CoinFace, boolean>>({
        front: false,
        back: false,
    });
    // last pos wher cusror was
    const lastPositions = React.useRef<Record<CoinFace, Vector2d | null>>({
        front: null,
        back: null,
    });
    // idfk what this is
    const [, forceRender] = React.useReducer((count: number) => count + 1, 0);
    const canvasesRef = React.useRef<
        Record<CoinFace, HTMLCanvasElement | null>
    >({
        front: null,
        back: null,
    });
    const contextsRef = React.useRef<
        Record<CoinFace, CanvasRenderingContext2D | null>
    >({
        front: null,
        back: null,
    });
    const imageRefs = React.useRef<Record<CoinFace, KonvaImage | null>>({
        front: null,
        back: null,
    });
    const containerRefs = React.useRef<Record<CoinFace, HTMLDivElement | null>>(
        {
            front: null,
            back: null,
        }
    );
    // how big the canvas is
    const [stageSize, setStageSize] = React.useState(() => ({
        width: 300,
        height: 300,
    }));
    const [faceSizes, setFaceSizes] = React.useState<
        Record<CoinFace, { width: number; height: number }>
    >({
        front: { width: 0, height: 0 },
        back: { width: 0, height: 0 },
    });

    const faceDimensions = React.useMemo(() => {
        return {
            width: 300,
            height: 300,
        };
    }, []);

    // makes the canavs
    React.useEffect(() => {
        if (typeof document === "undefined") {
            return;
        }

        COIN_FACES.forEach((face) => {
            const canvas = document.createElement("canvas");
            const context = canvas.getContext("2d");

            if (!context) {
                console.error(
                    `Failed to obtain 2D drawing context for ${face}.`
                );
                return;
            }

            canvas.width = 300;
            canvas.height = 300;
            configureContext(context, color, size);
            setBackground(context, canvas);

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

            canvas.width = 300;
            canvas.height = 300;
            configureContext(context, color, size);
            setBackground(context, canvas);
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

    // undoing of things (saves the state of canvas)
    React.useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.ctrlKey && event.key === "z") {
                event.preventDefault();
                const face = currentFace;
                const stack = undoStacks[face];
                if (stack.length > 0) {
                    const lastState = stack.pop();
                    const context = contextsRef.current[face];
                    const canvas = canvasesRef.current[face];
                    if (context && canvas && lastState) {
                        context.putImageData(lastState, 0, 0);
                        imageRefs.current[face]?.getLayer()?.batchDraw();
                    }
                    setUndoStacks((prev) => ({ ...prev, [face]: stack }));
                }
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [currentFace, undoStacks]);

    // drawing
    const handlePointerDown = React.useCallback(
        (face: CoinFace, event: KonvaEventObject<MouseEvent | TouchEvent>) => {
            setCurrentFace(face);
            const context = contextsRef.current[face];
            const canvas = canvasesRef.current[face];
            if (context && canvas) {
                const imageData = context.getImageData(
                    0,
                    0,
                    canvas.width,
                    canvas.height
                );
                setUndoStacks((prev) => {
                    const newStack = [...prev[face], imageData];
                    if (newStack.length > 10) newStack.shift();
                    return { ...prev, [face]: newStack };
                });
            }

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
                floodFill(
                    context,
                    Math.floor(localPos.x),
                    Math.floor(localPos.y),
                    color
                );
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

    const getClipFunc = (width: number, height: number) => {
        const centerX = width / 2;
        const centerY = height / 2;
        const radius = Math.min(width, height) / 2 - 10;

        return (ctx: CanvasRenderingContext2D) => {
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
            ctx.closePath();
            ctx.clip();
        };
    };

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
        setBackground(context, canvas);
        configureContext(context, color, size);
        imageRefs.current[face]?.getLayer()?.batchDraw();
    }, []);
    // exporting the canvas as image
    const handleExportFace = React.useCallback(async (face: CoinFace) => {
        const canvas = canvasesRef.current[face];
        if (canvas) {
            const userId = await getUserID();
            if (!userId) {
                console.error('User not logged in');
                return;
            }
            canvas.toBlob((blob) => {
                if (blob) {
                    const file = new File([blob], `coin-${face}.png`, { type: 'image/png' });
                    storage.createFile({
                        bucketId: coin_bucket,
                        fileId: ID.unique(),
                        file: file,
                        permissions: [Permission.read(Role.any()), Permission.write(Role.user(userId))],
                    }).then((response) => {
                        console.log('File uploaded:', response);
                    }).catch((error) => {
                        console.error('Upload failed:', error);
                    });
                }
            });
        }
    }, []);
    // everyone knows this lmao
    return (
        <div className="flex flex-col gap-[25px] p-[25px]">
            <div className="flex gap-[25px] bg-accent p-3 rounded-full border font-mono justify-center">
                <label className="flex items-center gap-2">
                    <span>Tool:</span>
                    <select
                        value={tool}
                        onChange={handleToolChange}
                        className="bg-accent-foreground/20 p-1"
                    >
                        <option value="brush">Brush</option>
                        <option value="eraser">Eraser</option>
                        <option value="fill">Fill</option>
                    </select>
                
                </label>
                <label className="flex items-center gap-2">
                    <span>Color:</span>
                    <input
                        type="color"
                        value={color}
                        onChange={(e) => setColor(e.target.value)}
                    />
                </label>
                <label className="flex items-center gap-2">
                    <span>Size:</span>
                    <input
                        type="range"
                        min="1"
                        max="40"
                        value={size}
                        onChange={(e) => setSize(Number(e.target.value))}
                    />
                </label>
            </div>
            <div className="flex flex-wrap gap-5">
                {COIN_FACES.map((face) => (
                    <div
                        key={face}
                        ref={(node) => {
                            containerRefs.current[face] = node;
                        }}
                        className="flex min-w-[240px] gap-3 border-2 border-dashed rounded p-3"
                    >
                        <div className="w-[300px] h-[300px] rounded-full">
                            <Stage
                                width={300}
                                height={300}
                                onMouseDown={(event) =>
                                    handlePointerDown(face, event)
                                }
                                onMouseMove={(event) =>
                                    handlePointerMove(face, event)
                                }
                                onMouseUp={() => handlePointerUp(face)}
                                onMouseLeave={() => handlePointerUp(face)}
                                onTouchStart={(event) =>
                                    handlePointerDown(face, event)
                                }
                                onTouchMove={(event) =>
                                    handlePointerMove(face, event)
                                }
                                onTouchEnd={() => handlePointerUp(face)}
                                onTouchCancel={() => handlePointerUp(face)}
                                className="border-2 border-accent-foreground overflow-hidden rounded-full"
                            >
                                <Layer>
                                    <Image
                                        ref={(node) => {
                                            imageRefs.current[face] = node;
                                        }}
                                        image={
                                            canvasesRef.current[face] ??
                                            undefined
                                        }
                                        x={0}
                                        y={0}
                                        clipFunc={getClipFunc(300, 300)}
                                    />
                                </Layer>
                            </Stage>
                        </div>
                        <div className="font-mono text-xl flex gap-3 items-end tracking-wider">
                            {FACE_LABELS[face]}
                            <button
                                type="button"
                                onClick={() => handleClearFace(face)}
                                className=" px-2.5 py-1 text-xs rounded-md border border-gray-300 bg-transparent cursor-pointer"
                            >
                                Clear
                            </button>
                            <button
                                type="button"
                                onClick={() => handleExportFace(face)}
                                className=" px-2.5 py-1 text-xs rounded-md border border-gray-300 bg-transparent cursor-pointer"
                            >
                                Export
                            </button>
                        </div>
                    </div>
                ))}
            </div>
            <span className="font-mono opacity-70">
                Note: Please draw inside the circle. Why? End result will be
                cropped to the circle anything past the circle{" "}
            </span>
        </div>
    );
}
