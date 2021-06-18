import React, {useState} from "react";
import ClassNode from "./ClassNode";
import FunctionNode from "./FunctionNode";
import {isEmptyList} from "../../Utility/listOperations";
import classNames from "classnames";
import PythonModule from "../../model/PythonModule";
import PythonFunction from "../../model/PythonFunction";

type ModuleNodeProps = {
    parentPath: string[],
    pythonModule: PythonModule,
    selection: string[],
    setSelection: (newValue: string[]) => void,
    setParameters: any,
    setSelectedFunction: Setter<Nullable<PythonFunction>>
}

const ModuleNode = ({
                        parentPath,
                        pythonModule,
                        selection,
                        setSelection,
                        setParameters,
                        setSelectedFunction
                    }: ModuleNodeProps) => {

    /** This is the Name of this module without its packages name prefixed. */

    const [, ...moduleName] = pythonModule.name.split(".");

    const path = parentPath.concat(moduleName)
    const [childVisible, setChildVisibility] = useState(false);
    let hasClasses = !isEmptyList(pythonModule.classes);
    let hasFunctions = !isEmptyList(pythonModule.functions);
    const hasChildren = hasClasses || hasFunctions;

    const cssClasses = classNames(
        "tree-view-row", {
            "text-muted": !hasChildren,
            "cursor-na": !hasChildren,
            "pl-2rem": !hasChildren,
            "pl-1-5rem": hasChildren,
            "selected": (selection.join() === path.join()) && hasChildren,
        }
    );

    return (
        <div className="module-node">
            <div className={cssClasses}
                 onClick={() => {
                     setSelection(path)
                     setChildVisibility(!childVisible)
                 }}>
                {(hasClasses || hasFunctions) &&
                <span className="indicator visibility-indicator">{childVisible ? "▼" : "▶"}</span>}
                <span className="indicator">
                    □
                </span>
                {" "}
                <span>
                    {pythonModule.name}
                </span>
            </div>
            <div>
                {hasClasses && childVisible && <div>
                    {pythonModule.classes.map(moduleClass => (
                        <ClassNode key={moduleClass.name}
                                   parentPath={path}
                                   pythonClass={moduleClass}
                                   selection={selection}
                                   setSelection={setSelection}
                                   moduleName={pythonModule.name}
                                   setParameters={setParameters}
                                   setSelectedFunction={setSelectedFunction}
                        />
                    ))}
                </div>}
                {hasFunctions && childVisible && <div>
                    {pythonModule.functions.map(moduleFunction => (
                        <FunctionNode parentPath={path}
                                      key={moduleFunction.name}
                                      pythonFunction={moduleFunction}
                                      selection={selection}
                                      setSelection={setSelection}
                                      setParameters={setParameters}
                                      setSelectedFunction={setSelectedFunction}
                        />
                    ))}
                </div>}
            </div>
        </div>
    )
};

export default ModuleNode;