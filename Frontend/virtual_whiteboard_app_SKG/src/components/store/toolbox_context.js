const { createContext } = require("react");

const toolboxContext = createContext({
    toolboxState:{},
    changeStroke: () => {},
    changeFill:()=>{},
    changeSize: ()=>{},
});

export default toolboxContext;

