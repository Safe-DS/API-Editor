import React from "react";

const ClassNode = ({inputClass}) => {
    return (
        <li>
            <div>
                {inputClass.name}
            </div>
            <ul>
                {inputClass.superclasses.map(moduleClass => (
                    <ClassNode key={moduleClass.name} inputClass={moduleClass}/>
                ))}
            </ul>
        </li>
    )
};

export default ClassNode;