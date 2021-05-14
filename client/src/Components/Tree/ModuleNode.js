import React, {useState} from "react";
import ClassNode from "./ClassNode";
import FunctionNode from "./FunctionNode";

const ModuleNode = ({inputModule}) => {
    const [childVisible, setChildVisibility] = useState(false);
    this.callbackFunction = (childData) => {
        this.setState({message: childData})
    }

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
                            <FunctionNode key={moduleFunction.name} inputFunction={moduleFunction}
                                          parentCallback = {this.callbackFunction}/>
                        ))}
                        console.log(childData)
                    </ul>
                }
            </div>
        </li>
    )
};

export default ModuleNode;