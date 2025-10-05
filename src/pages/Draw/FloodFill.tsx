export function floodFill(
    context: CanvasRenderingContext2D,
    x: number,
    y: number,
    fillColor: string,
    tolerance: number = 0
) {
    const imageData = context.getImageData(0, 0, context.canvas.width, context.canvas.height);
    const data = imageData.data;
    const width = context.canvas.width;
    const height = context.canvas.height;

    const matchColor = (offset: number, r: number, g: number, b:number) => {
        const dr = Math.abs(data[offset] - r);
        const dg = Math.abs(data[offset + 1] - g);
        const db = Math.abs(data[offset + 2] - b);
        return dr <= tolerance && dg <= tolerance && db <= tolerance;
    }

    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = 1;
    tempCanvas.height = 1;
    const tempCtx = tempCanvas.getContext("2d")!;
    tempCtx.fillStyle = fillColor;
    tempCtx.fillRect(0, 0, 1, 1);
    const fillData = tempCtx.getImageData(0, 0, 1, 1).data;
    const r = fillData[0], g = fillData[1], b = fillData[2];

    if (x < 0 || x >= width || y < 0 || y >= height) return;

    const startOffset = (y * width + x) * 4;
    const startR = data[startOffset], startG = data[startOffset + 1], startB = data[startOffset + 2];

    if (startR === r && startG === g && startB === b) return;

    const stack: [number, number][] = [[x, y]];
    const visited = new Set<string>();

    while (stack.length > 0) {
        const [cx, cy] = stack.pop()!;
        const key = `${cx},${cy}`;
        if (visited.has(key)) continue;
        visited.add(key);

        const offset = (cy * width + cx) * 4;
        if (!matchColor(offset, startR, startG, startB)) continue;

        data[offset] = r;
        data[offset + 1] = g;
        data[offset + 2] = b;
        data[offset + 3] = 255;

        if (cx > 0) stack.push([cx - 1, cy]);
        if (cx < width - 1) stack.push([cx + 1, cy]);
        if (cy > 0) stack.push([cx, cy - 1]);
        if (cy < height - 1) stack.push([cx, cy + 1]);
    }

    context.putImageData(imageData, 0, 0);
}