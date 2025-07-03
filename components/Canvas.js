import React, {
  useRef,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from "react";
import { Box } from "@mui/material";

const Canvas = forwardRef(
  ({ width, height, onSelectionChange, onObjectModified }, ref) => {
    const canvasRef = useRef(null);
    const fabricCanvasRef = useRef(null);

    useImperativeHandle(ref, () => ({
      getCanvas: () => fabricCanvasRef.current,
      addElement: (element) => {
        if (fabricCanvasRef.current) {
          fabricCanvasRef.current.add(element);
          fabricCanvasRef.current.setActiveObject(element);
        }
      },
      removeActiveElement: () => {
        if (fabricCanvasRef.current) {
          const activeObject = fabricCanvasRef.current.getActiveObject();
          if (activeObject) {
            fabricCanvasRef.current.remove(activeObject);
          }
        }
      },
      clearCanvas: () => {
        if (fabricCanvasRef.current) {
          fabricCanvasRef.current.clear();
        }
      },
      exportCanvas: () => {
        if (fabricCanvasRef.current) {
          return fabricCanvasRef.current.getObjects();
        }
        return [];
      },
    }));

    useEffect(() => {
      if (typeof window !== "undefined" && canvasRef.current) {
        const fabric = require("fabric").fabric;

        // Dispose existing canvas if it exists
        if (fabricCanvasRef.current) {
          fabricCanvasRef.current.dispose();
        }

        const canvas = new fabric.Canvas(canvasRef.current, {
          width: width,
          height: height,
          backgroundColor: "#ffffff",
          selection: true,
        });

        // Enable object controls
        canvas.on("selection:created", (e) => {
          if (onSelectionChange) {
            onSelectionChange(e.selected[0]);
          }
        });

        canvas.on("selection:updated", (e) => {
          if (onSelectionChange) {
            onSelectionChange(e.selected[0]);
          }
        });

        canvas.on("selection:cleared", () => {
          if (onSelectionChange) {
            onSelectionChange(null);
          }
        });

        canvas.on("object:modified", (e) => {
          if (onObjectModified) {
            onObjectModified(e.target);
          }
        });

        // Enable object moving and scaling
        canvas.on("object:moving", (e) => {
          const obj = e.target;
          // Snap to grid (optional)
          obj.set({
            left: Math.round(obj.left / 10) * 10,
            top: Math.round(obj.top / 10) * 10,
          });
          canvas.renderAll();
        });

        fabricCanvasRef.current = canvas;

        // Cleanup function
        return () => {
          if (fabricCanvasRef.current) {
            fabricCanvasRef.current.dispose();
          }
        };
      }
    }, [width, height, onSelectionChange, onObjectModified]);

    return (
      <Box
        sx={{
          border: "2px solid #ddd",
          borderRadius: 2,
          overflow: "hidden",
          backgroundColor: "#f9f9f9",
          p: 1,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <canvas ref={canvasRef} style={{ border: "1px solid #ccc" }} />
      </Box>
    );
  }
);

Canvas.displayName = "Canvas";

export default Canvas;
