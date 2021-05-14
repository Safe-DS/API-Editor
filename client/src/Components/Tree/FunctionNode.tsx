import React from "react";
import PythonFunction from "../../model/PythonFunction";

type FunctionNodeProps = {
    inputFunction: PythonFunction,
    selection: string,
    setSelection: (newValue: string) => void,
}

const FunctionNode = ({inputFunction, selection, setSelection}:FunctionNodeProps) => {

    return (
        <div className="pl-2-5rem">
            <div className={selection === inputFunction.name ? "selected" : ""}
                 onClick={() =>{
                     setSelection(inputFunction.name);
                     console.log(inputFunction.name + " has been selected.");
                     console.log(inputFunction.parameters);
                 }}>
                <span>
                    {"𝑓 "  + inputFunction.name}
                </span>
            </div>
        </div>
    );
};

export default FunctionNode;