import { useCallback, useContext, useEffect, useLayoutEffect, useRef } from "react";
import rough from "roughjs/bin/rough";
import boardContext from "../store/board-context";
import { TOOL_ACTION_TYPES, TOOL_ITEMS } from "../../constants";
import toolboxContext from "../store/toolbox_context";
import classes from "./index.module.css";
import { getSvgPathFromStroke } from "../../utils/element";
import getStroke from "perfect-freehand";
import debounce from 'lodash/debounce'; // Add this import

function Board() {
  const canvasRef = useRef();
  const textAreaRef = useRef();
  const {
    elements,
    toolActionType,
    boardMouseDownHandler,
    boardMouseMoveHandler,
    boardMouseUpHandler,
    textAreaBlurHandler,
    undo,
    redo, 
    sendDrawUpdate,
  } = useContext(boardContext);
  const { toolboxState } = useContext(toolboxContext);
  
  const debouncedSendDrawUpdate = useCallback(
    debounce((elements) => {
      if (sendDrawUpdate) {
        sendDrawUpdate(elements);
      }
    }, 300), // Adjust the delay as needed
    [sendDrawUpdate]
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }, []);

  useEffect(() => {
    function handleKeydown(event) {
      // Check which key has been pressed via event object
      if (event.ctrlKey && event.key === 'z') {
        undo();
      } else if (event.ctrlKey && event.key === 'y') {
        redo();
      }
    }

    document.addEventListener("keydown", handleKeydown);
    return () => {
      document.removeEventListener("keydown", handleKeydown);
    };
  }, [undo, redo]);

  useLayoutEffect(() => {
    // Print the elements to the canvas 
    console.log("Elements to render:", elements); // Debugging log
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    context.clearRect(0, 0, canvas.width, canvas.height); // Add this to clear before redrawing
    context.save();
    const roughCanvas = rough.canvas(canvas);
   
    if (elements && elements.length > 0) {
      elements.forEach((element) => {
        switch (element.type) {
          case TOOL_ITEMS.RECTANGLE:
          case TOOL_ITEMS.LINE:
          case TOOL_ITEMS.CIRCLE:
          case TOOL_ITEMS.ARROW:
            roughCanvas.draw(element.roughEle);
            break;
          case TOOL_ITEMS.BRUSH:
            context.fillStyle = element.stroke;
            const pathString = element.path ? element.path : getSvgPathFromStroke(getStroke(element.points));
            const brushPath = new Path2D(pathString);
            context.fill(brushPath);
            context.restore();
            break;
          case TOOL_ITEMS.TEXT:
            context.textBaseline = "top";
            context.font = `${element.size}px Caveat`;
            context.fillStyle = element.stroke;
            context.fillText(element.text, element.x1, element.y1);
            context.restore();
            break;
          default:
            throw new Error("Type not recognized curr");
        }
      });
    } else {
      console.error("Elements array is undefined");
    }

    // return () => {
    //   context.clearRect(0, 0, canvas.width, canvas.height);
    // };
  }, [elements]);

  useEffect(() => {
    const textArea = textAreaRef.current;
    if (toolActionType === TOOL_ACTION_TYPES.WRITING) {
      setTimeout(() => {
        textArea.focus();
      }, 0);
    }
  }, [toolActionType]);

  const handleMouseDown = (event) => {
    console.log("Mouse Down - Toolbox State:", toolboxState); // Debugging log
    boardMouseDownHandler(event, toolboxState);
  };

  const handleMouseMove = (event) => {
    console.log("Mouse Move - Toolbox State:", toolboxState); // Debugging log
    boardMouseMoveHandler(event, toolboxState);
  };

  const handleMouseUp = () => {
  boardMouseUpHandler();
  setTimeout(() => {
    debouncedSendDrawUpdate(elements); // ✅ use updated elements
  }, 0); // Ensure the update is sent after the mouse up event
  //debouncedSendDrawUpdate(elements); // Use the debounced function to send updates
  console.log("Mouse Up - Toolbox State:", toolboxState);
  console.log("Mouse Up - Toolbox State:", toolboxState);
  };

  return (
    <>
      {toolActionType === TOOL_ACTION_TYPES.WRITING && (
        <textarea
          type="text"
          className={classes.textElementBox}
          ref={textAreaRef}
          style={{
            top: elements[elements.length - 1].y1,
            left: elements[elements.length - 1].x1,
            fontSize: `${elements[elements.length - 1]?.size}px`,
            color: elements[elements.length - 1]?.stroke,
          }}
          onBlur={(event) =>
            textAreaBlurHandler(event.target.value, toolboxState)
          }
        />
      )}
      <canvas
        ref={canvasRef}
        id="canvas"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      />
    </>
  );
}

export default Board;