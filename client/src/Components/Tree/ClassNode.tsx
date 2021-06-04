import React, {useState} from "react";
import PythonClass from "../../model/PythonClass";
import classNames from "classnames";
import FunctionNode from "./FunctionNode";
import {isEmptyList} from "../../Utility/listOperations";

type ClassNodeProps = {
    pythonClass: PythonClass,
    selection: string,
    setSelection: (newValue: string) => void,
    moduleName: string
}

const ClassNode = ({pythonClass, selection, setSelection, moduleName}: ClassNodeProps) => {
    const [childVisible, setChildVisibility] = useState(false);

    const hasMethods = isEmptyList(pythonClass.methods);

    const fullQualifiedName = moduleName + "." + pythonClass.name;

    const cssClasses = classNames(
        "pl-3rem", "tree-view-row",
        {
            "selected": selection === fullQualifiedName,
        }
    );

    return (
        <div className="class-node">
            <div className={cssClasses}
                 onClick={() => {
                     setSelection(fullQualifiedName)
                     setChildVisibility(!childVisible);
                     console.log(pythonClass.name + " has been selected.");
                 }}>
                { hasMethods && <span className="indicator visibility-indicator">{ childVisible ? "▼" : "▶" }</span>}
                <span className="indicator">
                    𝒞
                </span>
                { " " }
                <span>
                    {pythonClass.name}
                </span>
            </div>
            {
                hasMethods && childVisible &&
                <>
                    {pythonClass.methods.map(method => (
                        <FunctionNode parentFullQualifiedName={fullQualifiedName}
                                      key={method.name}
                                      pythonFunction={method}
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