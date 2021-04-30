import React from "react";

const FunctionNode = ({inputFunction}) => {
    return (
        <li>
            <div onClick={() =>{
                console.log(inputFunction.name + " has been selected.");
                console.log(inputFunction.parameters);
            }
            }>
                {inputFunction.name}
            </div>
        </li>
    );
};

export default FunctionNode;