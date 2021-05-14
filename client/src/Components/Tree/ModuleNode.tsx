import React, {useState} from "react";
import ClassNode from "./ClassNode";
import FunctionNode from "./FunctionNode";
import {isEmptyList} from "../../Utility/listOperations";
import classNames from "classnames";
import PythonModule from "../../model/PythonModule";

type ModuleNodeProps = {
    inputModule: PythonModule,
    selection: string,
    setSelection: (newValue: string) => void,
}

const ModuleNode = ({inputModule, selection, setSelection}: ModuleNodeProps) => {
    const [childVisible, setChildVisibility] = useState(false);

    let hasClasses = isEmptyList(inputModule.classes);
    let hasFunctions = isEmptyList(inputModule.functions);

    const cssClasses = classNames({
        "pl-2-5rem": !(hasClasses || hasFunctions),
        "pl-1rem": hasClasses || hasFunctions,
        "selected": selection === inputModule.name,
    });

         return (
        <div className="module-node">
            <div className={cssClasses}
                onClick={() => {
                     setSelection(inputModule.name)
                    setChildVisibility(!childVisible)
                    console.log(inputModule.name + " has been selected.");
                 }}>
                { (hasClasses || hasFunctions) &&
                    <span className="visibility-indicator">{ childVisible ? "↓" : "→" }</span>
                }
                <span className="module-name">
                    {inputModule.name}
                </span>
            </div>
            <div>
                {
                    hasClasses && childVisible &&
                        <div>
                            {inputModule.classes.map(moduleClass => (
                                <ClassNode key={moduleClass.name}
                                           inputClass={moduleClass}
                                           selection={selection}
                                           setSelection={setSelection}/>
                            ))}
                        </div>
                }
                {
                    hasFunctions && childVisible &&
                    <div>
                        {inputModule.functions.map(moduleFunction => (
                            <FunctionNode key={moduleFunction.name}
                                          inputFunction={moduleFunction}
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