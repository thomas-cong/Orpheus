// FreehandCanvas.tsx - A React component that provides a canvas for freehand drawing
import React, { useRef, useEffect, useState } from "react";

const FreehandCanvas = () => {
    // Reference to the canvas DOM element
    const canvasRef = useRef<HTMLCanvasElement>(null);
    // State to track if user is currently drawing
    const [isDrawing, setIsDrawing] = useState(false);
    // State to store the last position of the cursor
    const [lastPos, setLastPos] = useState({ x: 0, y: 0 });
    // State to store position data for all strokes - array of stroke data
    // Each stroke is an array of [x,y] coordinate pairs
    const [positionData, setPositionData] = useState<
        Array<Array<[number, number]>>
    >([]);
    // Current stroke being drawn - array of [x,y] coordinate pairs
    const [currentStrokeData, setCurrentStrokeData] = useState<
        Array<[number, number]>
    >([]);
    // Initialize canvas when component mounts
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        // Set canvas dimensions to match its displayed size
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;

        // Get the drawing context and set initial drawing properties
        const context = canvas.getContext("2d");
        if (!context) return;
        context.lineCap = "round"; // Makes line endings rounded
        context.lineJoin = "round"; // Makes line joins rounded
        context.lineWidth = 2; // Sets line thickness to 2px
        context.strokeStyle = "#000"; // Sets line color to black
    }, []);
    useEffect(() => {
        console.log(positionData);
    }, [positionData]);

    // Handler for when mouse button is pressed down
    const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const rect = canvasRef.current?.getBoundingClientRect();
        if (!rect) return;

        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Calculate and store the position where drawing begins
        setLastPos({
            x: x, // Adjust for canvas position
            y: y,
        });

        // Start a new stroke with the initial point
        setCurrentStrokeData([[x, y]]);
        setIsDrawing(true); // Start drawing mode
    };

    // Handler for mouse movement
    const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
        // Only draw if mouse button is pressed
        if (!isDrawing) return;

        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // Get canvas position
        const rect = canvas.getBoundingClientRect();

        // Calculate current cursor position
        const currentPos = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        };

        // Draw a line from the last position to the current position
        ctx.beginPath(); // Start a new path
        ctx.moveTo(lastPos.x, lastPos.y); // Move to last position
        ctx.lineTo(currentPos.x, currentPos.y); // Draw line to current position
        ctx.stroke(); // Render the line

        // Update last position for next movement
        setLastPos(currentPos);

        // Add the current point to the current stroke data
        if (currentPos.x !== lastPos.x || currentPos.y !== lastPos.y) {
            setCurrentStrokeData((prev) => [
                ...prev,
                [currentPos.x, currentPos.y] as [number, number],
            ]);
        }
    };

    // Handler for when mouse button is released
    const handleMouseUp = () => {
        setIsDrawing(false); // Stop drawing mode

        // Only add the stroke if it has points
        if (currentStrokeData.length > 0) {
            // Add the completed stroke to position data and reset current stroke
            setPositionData((prev) => [...prev, currentStrokeData]);
            setCurrentStrokeData([]);
        }
    };

    return (
        <canvas
            ref={canvasRef} // Connect the ref to the canvas element
            style={{
                width: "100%", // Make canvas responsive
                height: "400px", // Fixed height
                border: "1px solid #ccc", // Light gray border
            }}
            onMouseDown={handleMouseDown} // Start drawing when mouse pressed
            onMouseMove={handleMouseMove} // Draw while mouse moves
            onMouseUp={handleMouseUp} // Stop drawing when mouse released
            onMouseLeave={handleMouseUp} // Also stop drawing if mouse leaves canvas
        />
    );
};

export default FreehandCanvas;
