import React from "react";

const FunctionNode = ({inputFunction}) => {
    return (
        <li key={inputFunction}>
            <div>
                {inputFunction.name}
            </div>
        </li>
    );
};

export default FunctionNode;