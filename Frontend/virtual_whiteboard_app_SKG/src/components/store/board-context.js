import { createContext } from "react";

const boardContext = createContext({
    activeToolItem:'',
    toolActionType: "",
    elements:[],//whenever elements will change then my canvas will be re-drawn 
       history:[[]],  
       index:0,
        boardMouseDownHandler:()=>{},
        boardMouseMoveHandler:()=>{},
        boardMouseUpHandler:()=>{},
        changeToolHandler:()=>{},
        textAreaBlurHandler:()=>{},
        sendDrawUpdate:()=>{},
        setElements:()=>{},
});
// and elements will change with the help of mouse events 
export default boardContext;