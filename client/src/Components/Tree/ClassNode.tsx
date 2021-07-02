import React, {useState} from "react";
import PythonClass from "../../model/PythonClass";
import classNames from "classnames";
import FunctionNode from "./FunctionNode";
import {isEmptyList} from "../../util/listOperations";
import PythonFunction from "../../model/PythonFunction";
import PythonParameter from "../../model/PythonParameter";

type ClassNodeProps = {
    parentPath: string[],
    pythonClass: PythonClass,
    selection: string[],
    setSelection: (newValue: string[]) => void,
    moduleName: string,
    setParameters: Setter<PythonParameter[]>,
    setSelectedFunction: Setter<Nullable<PythonFunction>>
}

export default function ClassNode({
                                      parentPath,
                                      pythonClass,
                                      selection,
                                      setSelection,
                                      setParameters,
                                      setSelectedFunction
                                  }: ClassNodeProps): JSX.Element {

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
}
