import React, {useState} from "react";
import ClassNode from "./ClassNode";
import FunctionNode from "./FunctionNode";
import {isEmptyList} from "../../Utility/listOperations";
import classNames from "classnames";
import PythonModule from "../../model/PythonModule";

type ModuleNodeProps = {
    pythonModule: PythonModule,
    selection: string,
    setSelection: (newValue: string) => void,
}

const ModuleNode = ({pythonModule, selection, setSelection}: ModuleNodeProps) => {
    const [childVisible, setChildVisibility] = useState(false);

    let hasClasses = isEmptyList(pythonModule.classes);
    let hasFunctions = isEmptyList(pythonModule.functions);

    const cssClasses = classNames(
        "tree-view-row",
        {
            "pl-2rem": !(hasClasses || hasFunctions),
            "pl-1-5rem": (hasClasses || hasFunctions),
            "selected": selection === pythonModule.name,
        }
    );

         return (
        <div className="module-node">
            <div className={cssClasses}
                onClick={() => {
                     setSelection(pythonModule.name)
                    setChildVisibility(!childVisible)
                    console.log(pythonModule.name + " has been selected.");
                 }}>
                { (hasClasses || hasFunctions) &&
                    <span className="indicator visibility-indicator">{ childVisible ? "▼" : "▶" }</span>
                }
                <span className="indicator">
                    □
                </span>
                { " " }
                <span>
                    { pythonModule.name }
                </span>
            </div>
            <div>
                {
                    hasClasses && childVisible &&
                        <div>
                            {pythonModule.classes.map(moduleClass => (
                                <ClassNode key={moduleClass.name}
                                           pythonClass={moduleClass}
                                           selection={selection}
                                           setSelection={setSelection}
                                           moduleName={pythonModule.name}
                                />
                            ))}
                        </div>
                }
                {
                    hasFunctions && childVisible &&
                    <div>
                        {pythonModule.functions.map(moduleFunction => (
                            <FunctionNode parentFullQualifiedName={pythonModule.name}
                                          key={moduleFunction.name}
                                          pythonFunction={moduleFunction}
                                          selection={selection}
                                          setSelection={setSelection}/>
                        ))}
                    </div>
                }
            </div>
        </div>
    )
};

export default ModuleNode;