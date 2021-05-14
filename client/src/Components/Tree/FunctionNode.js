import React from "react";

const sendData = () => {
    this.props.parentCallback("Hey Popsie, How’s it going?");
}
const FunctionNode = ({inputFunction}) => {
    return (
        <li>
            <div onClick={() =>{
                console.log(inputFunction.name + " has been selected.");
                console.log(inputFunction.parameters);
                sendData()
            }
            }>
                {inputFunction.name}
            </div>
        </li>
    );
};

export default FunctionNode;