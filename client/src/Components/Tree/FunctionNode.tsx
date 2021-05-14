import React from "react";
import PythonFunction from "../../model/PythonFunction";
import classNames from "classnames";

type FunctionNodeProps = {
    inputFunction: PythonFunction,
    selection: string,
    setSelection: (newValue: string) => void,
    isMethod?: boolean,
}

const FunctionNode = ({inputFunction, selection, setSelection, isMethod=false}:FunctionNodeProps) => {

    const cssClasses = classNames(
        {
            "pl-2-5rem": !isMethod,
            "pl-4rem": isMethod,
            "selected": selection === inputFunction.name,
        }
    );

    return (
        <div className="function-node">
            <div className={cssClasses}
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