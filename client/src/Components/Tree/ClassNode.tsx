import React, {useState} from "react";
import PythonClass from "../../model/PythonClass";
import classNames from "classnames";
import FunctionNode from "./FunctionNode";
import {isEmptyList} from "../../Utility/listOperations";

type ClassNodeProps = {
    inputClass: PythonClass,
    selection: string,
    setSelection: (newValue: string) => void,
}

const ClassNode = ({inputClass, selection, setSelection}: ClassNodeProps) => {
    const [childVisible, setChildVisibility] = useState(false);

    const hasMethods = isEmptyList(inputClass.methods);

    const cssClasses = classNames(
        "pl-2-5rem",
        {
            "selected": selection === inputClass.name,
        }
    );

    return (
        <div className="class-node">
            <div className={cssClasses}
                 onClick={() => {
                     setSelection(inputClass.name)
                     setChildVisibility(!childVisible);
                     console.log(inputClass.name + " has been selected.");
                 }}>
                <span className="class-name">
                    {"𝒞 " + inputClass.name}
                </span>
            </div>
            {
                hasMethods && childVisible &&
                <>
                    {inputClass.methods.map(method => (
                        <FunctionNode key={method.name}
                                   inputFunction={method}
                                   selection={selection}
                                   setSelection={setSelection}
                                      isMethod={true}
                        />
                    ))}
                </>
            }
        </div>
    )
};

export default ClassNode;