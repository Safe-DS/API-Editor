import React, {useState} from "react";
import ClassNode from "./ClassNode";
import FunctionNode from "./FunctionNode";

const ModuleNode = ({inputModule, selection, setSelection}) => {
    const [childVisible, setChildVisibility] = useState(false);

    let hasClasses = !!inputModule.classes && inputModule.classes.length !== 0;
    let hasFunctions = !!inputModule.functions && inputModule.functions.length !== 0;

    const cssClasses = [!(hasClasses || hasFunctions) ? "pl-2-5rem" : "pl-1rem",
                        selection === inputModule.name ? "selected" : ""].join(" ");

         return (
        <li>
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
            <div className="module-content">
                {
                    hasClasses && childVisible &&
                        <ul>
                            {inputModule.classes.map(moduleClass => (
                                <ClassNode key={moduleClass.name}
                                           inputClass={moduleClass}
                                           selection={selection}
                                           setSelection={setSelection}/>
                            ))}
                        </ul>
                }
                {
                    hasFunctions && childVisible &&
                    <ul>
                        {inputModule.functions.map(moduleFunction => (
                            <FunctionNode key={moduleFunction.name}
                                          inputFunction={moduleFunction}
                                          selection={selection}
                                          setSelection={setSelection}/>
                        ))}
                    </ul>
                }
            </div>
        </li>
    )
};

export default ModuleNode;