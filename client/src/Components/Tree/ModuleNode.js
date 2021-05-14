import React, {useState} from "react";
import ClassNode from "./ClassNode";
import FunctionNode from "./FunctionNode";

const ModuleNode = ({inputModule, setParameters}) => {
    const [childVisible, setChildVisibility] = useState(false);

    let hasClasses = !!inputModule.classes && inputModule.classes.length !== 0;
    let hasFunctions = !!inputModule.functions && inputModule.functions.length !== 0;

    return (
        <li>
            <div onClick={() => {
                setChildVisibility(!childVisible)
                console.log(inputModule.name + " has been selected.");
            }}>
                {inputModule.name}
            </div>
            <div>
                {
                    hasClasses && childVisible &&
                        <ul>
                            {inputModule.classes.map(moduleClass => (
                                <ClassNode key={moduleClass.name} inputClass={moduleClass}/>
                            ))}
                        </ul>
                }
                {
                    hasFunctions && childVisible &&
                    <ul>
                        {inputModule.functions.map(moduleFunction => (
                            <FunctionNode key={moduleFunction.name} inputFunction={moduleFunction} setParameters={setParameters}/>
                        ))}
                    </ul>
                }
            </div>
        </li>
    )
};

export default ModuleNode;