import React, {useState} from "react";
import PythonClass from "../../model/PythonClass";
import classNames from "classnames";
import FunctionNode from "./FunctionNode";
import {isEmptyList} from "../../Utility/listOperations";
import PythonFunction from "../../model/PythonFunction";

type ClassNodeProps = {
    parentPath: string[],
    pythonClass: PythonClass,
    selection: string[],
    setSelection: (newValue: string[]) => void,
    moduleName: string,
    setParameters: any,
    setSelectedFunction: Setter<Nullable<PythonFunction>>
}

const ClassNode = ({
                       parentPath,
                       pythonClass,
                       selection,
                       setSelection,
                       moduleName,
                       setParameters,
                       setSelectedFunction
                   }: ClassNodeProps) => {

    const [childVisible, setChildVisibility] = useState(false);
    const hasMethods = !isEmptyList(pythonClass.methods);
    const path = parentPath.concat(pythonClass.name);
    const cssClasses = classNames(
        "tree-view-row", {
            "text-muted": !hasMethods,
            "cursor-na": !hasMethods,
            "pl-3-5rem": !hasMethods,
            "pl-3rem": hasMethods,
            "selected": (selection.join() === path.join()) && hasMethods,
        }
    );

    return (
        <div className="class-node">
            <div className={cssClasses}
                 onClick={() => {
                     setSelection(path);
                     setChildVisibility(!childVisible);
                     setSelectedFunction(null);
                 }}>
                {hasMethods && <span className="indicator visibility-indicator">{childVisible ? "▼" : "▶"}</span>}
                <span className="indicator"> 𝒞 </span>
                {" "}
                <span> {pythonClass.name} </span>
            </div>
            {hasMethods && childVisible && <div>
                {pythonClass.methods.map(method => (
                    <FunctionNode parentPath={path}
                                  key={method.name}
                                  pythonFunction={method}
                                  selection={selection}
                                  setSelection={setSelection}
                                  isMethod={true}
                                  setParameters={setParameters}
                                  setSelectedFunction={setSelectedFunction}
                    />
                ))}
            </div>}
        </div>
    );
};

export default ClassNode;