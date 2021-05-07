import React, {useState} from "react";

const ClassNode = ({inputClass}) => {
    const [childVisible, setChildVisibility] = useState(false);

    let hasClasses = !!inputClass.superclasses && inputClass.superclasses.length !== 0;

    return (
        <li>
            <div onClick={() => {
                setChildVisibility(!childVisible)
                console.log(inputClass.name + " has been selected.");
            }}
            >
                {inputClass.name}
            </div>
            {
                hasClasses && childVisible &&
                <ul>
                    {inputClass.superclasses.map(moduleClass => (
                        <ClassNode key={inputClass.name} inputClass={moduleClass}/>
                    ))}
                </ul>
            }
        </li>
    )
};

export default ClassNode;