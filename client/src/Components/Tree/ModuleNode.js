import React, {useState} from "react";
import ClassNode from "./ClassNode";
import FunctionNode from "./FunctionNode";

const ModuleNode = ({inputModule}) => {
    const [childVisible, setChildVisibility] = useState(false);

    let hasClasses = !!inputModule.classes && inputModule.classes.length !== 0;
    let hasFunctions = !!inputModule.functions && inputModule.functions.length !== 0;

    return (
        <li key={inputModule.name}>
            <div onClick={() => setChildVisibility((v) => !v)}>
                {inputModule.name}
            </div>
            <div>
                {
                    hasClasses && childVisible &&
                        <ul>
                            {inputModule.classes.map(moduleClass => (
                                <ClassNode inputClass={moduleClass}/>
                            ))}
                        </ul>
                }
                {
                    hasFunctions && childVisible &&
                    <ul>
                        {inputModule.functions.map(moduleFunction => (
                            <FunctionNode inputFunction={moduleFunction}/>
                        ))}
                    </ul>
                }
            </div>
        </li>
    )
};

export default ModuleNode;