import React from "react";

const FunctionNode = ({inputFunction}) => {
    return (
        <li>
            <div>
                {inputFunction.name}
            </div>
        </li>
    );
};

export default FunctionNode;