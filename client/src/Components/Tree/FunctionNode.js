import React from "react";

const FunctionNode = ({inputFunction}) => {
    return (
        <li key={inputFunction.name}>
            <div onClick={() => console.log(inputFunction.parameters)}>
                {inputFunction.name}
            </div>
        </li>
    );
};

export default FunctionNode;