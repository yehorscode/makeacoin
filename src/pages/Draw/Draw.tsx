import React from "react";
import { Stage, Layer, Image } from "react-konva";
import type { KonvaEventObject } from "konva/lib/Node";
import type { Image as KonvaImage } from "konva/lib/shapes/Image";
import type { Vector2d } from "konva/lib/types";

// DISCLOSURE:
// AI was used while making the drawing page. The base code was made with a mix of the demo (https://konvajs.org/docs/sandbox/Free_Drawing.html) and ai assistance!!!!
// also uhhh
// math is hard :sob:
// why dont they add emojis to comments when using this type of things (:sob: for example)
// that is actuaally a great idea that i can make into an extension

type Tool = "brush" | "eraser";
type CoinFace = "front" | "back" | "ridge";

const DEFAULT_STAGE_PADDING = 25;
const DEFAULT_LINE_WIDTH = 5;

const COIN_FACES: CoinFace[] = ["front", "back", "ridge"];

const configureContext = (context: CanvasRenderingContext2D) => {
    context.strokeStyle = "#df4b26";
    context.lineJoin = "round";
    context.lineCap = "round";
    context.lineWidth = DEFAULT_LINE_WIDTH;
};

export default function DrawPage() {
    const [tool, setTool] = React.useState<Tool>("brush");
    const [activeFace, setActiveFace] = React.useState<CoinFace>("front");
    const isDrawing = React.useRef(false);
    const lastPos = React.useRef<Vector2d | null>(null);
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
    const [stageSize, setStageSize] = React.useState(() => ({
        width: typeof window !== "undefined" ? window.innerWidth : 0,
        height:
            typeof window !== "undefined"
                ? Math.max(window.innerHeight - DEFAULT_STAGE_PADDING, 0)
                : 0,
    }));

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
            configureContext(context);

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

    React.useEffect(() => {
        COIN_FACES.forEach((face) => {
            const canvas = canvasesRef.current[face];
            const context = contextsRef.current[face];

            if (!canvas || !context) {
                return;
            }

            canvas.width = stageSize.width;
            canvas.height = stageSize.height;
            configureContext(context);
        });
    }, [stageSize.height, stageSize.width]);

    const handleMouseDown = React.useCallback(
        (e: KonvaEventObject<MouseEvent | TouchEvent>) => {
            const stage = e.target.getStage();
            if (!stage) {
                return;
            }

            const pointerPosition = stage.getPointerPosition();
            if (!pointerPosition) {
                return;
            }

            isDrawing.current = true;
            lastPos.current = pointerPosition;
        },
        []
    );

    const handleMouseUp = React.useCallback(() => {
        isDrawing.current = false;
        lastPos.current = null;
    }, []);

    const handleMouseMove = React.useCallback(
        (e: KonvaEventObject<MouseEvent | TouchEvent>) => {
            if (!isDrawing.current) {
                return;
            }

            const context = contextsRef.current[activeFace];
            const image = imageRefs.current[activeFace];
            const previousPos = lastPos.current;

            if (!context || !image || !previousPos) {
                return;
            }

            const stage = e.target.getStage();
            const pointerPosition = stage?.getPointerPosition();

            if (!stage || !pointerPosition) {
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

            lastPos.current = pointerPosition;
            image.getLayer()?.batchDraw();
        },
        [activeFace, tool]
    );

    const handleToolChange = React.useCallback(
        (event: React.ChangeEvent<HTMLSelectElement>) => {
            setTool(event.target.value as Tool);
        },
        []
    );

    return (
        <>
            <select value={tool} onChange={handleToolChange}>
                <option value="brush">Brush</option>
                <option value="eraser">Eraser</option>
            </select>
            <select
                value={activeFace}
                onChange={(event) => setActiveFace(event.target.value as CoinFace)}
            >
                <option value="front">Front</option>
                <option value="back">Back</option>
                <option value="ridge">Ridge</option>
            </select>
            <Stage
                width={stageSize.width}
                height={stageSize.height}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onTouchStart={handleMouseDown}
                onTouchMove={handleMouseMove}
                onTouchEnd={handleMouseUp}
            >
                <Layer>
                    {COIN_FACES.map((face) => (
                        <Image
                            key={face}
                            ref={(node) => {
                                imageRefs.current[face] = node;
                            }}
                            image={canvasesRef.current[face] ?? undefined}
                            x={0}
                            y={0}
                            visible={face === activeFace}
                        />
                    ))}
                </Layer>
            </Stage>
        </>
    );
}
