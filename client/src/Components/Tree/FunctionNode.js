import React from "react";

const FunctionNode = ({inputFunction, selection, setSelection}) => {

    return (
        <li>
            <div className={selection === inputFunction.name ? "selected" : ""}
                onClick={() =>{
                setSelection(inputFunction.name);
                console.log(inputFunction.name + " has been selected.");
                console.log(inputFunction.parameters);
                }
            }>
                {"𝑓 "  + inputFunction.name}
            </div>
        </li>
    );
};

export default FunctionNode;