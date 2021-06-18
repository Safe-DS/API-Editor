import React, {useState} from "react";
import PythonClass from "../../model/PythonClass";
import classNames from "classnames";
import FunctionNode from "./FunctionNode";
import {isEmptyList} from "../../Utility/listOperations";

type ClassNodeProps = {
    parentPath: string[],
    pythonClass: PythonClass,
    selection: string[],
    setSelection: (newValue: string[]) => void,
    moduleName: string,
    setParameters: any,
}

const ClassNode = ({parentPath, pythonClass, selection, setSelection, moduleName, setParameters}: ClassNodeProps) => {

    const [childVisible, setChildVisibility] = useState(false);
    const hasMethods = isEmptyList(pythonClass.methods);
    const path = parentPath.concat(pythonClass.name);
    const cssClasses = classNames(
        "pl-3rem", "tree-view-row",
        {
            "text-muted": !hasMethods,
            "cursor-na":!hasMethods,
            "selected": (selection.join() === path.join()) && hasMethods,
        }
    );

    return (
        <div className="class-node">
            <div className={cssClasses}
                 onClick={() => {
                     setSelection(path);
                     setChildVisibility(!childVisible);
                 }}>
                 { hasMethods && <span className="indicator visibility-indicator">{ childVisible ? "▼" : "▶" }</span> }
                 <span className="indicator"> 𝒞 </span>
                 { " " }
                 <span> { pythonClass.name } </span>
            </div>
            { hasMethods && childVisible && <div>
                { pythonClass.methods.map(method => (
                    <FunctionNode parentPath={ path }
                                  key = { method.name }
                                  pythonFunction = { method }
                                  selection = { selection }
                                  setSelection = { setSelection }
                                  isMethod = { true }
                                  setParameters = { setParameters } />
                ))}
            </div> }
        </div>
    );
};

export default ClassNode;