import React, {useState} from "react";

const ClassNode = ({inputClass, selection, setSelection}) => {
    const [childVisible, setChildVisibility] = useState(false);

    let hasSuperClasses = !!inputClass.superclasses && inputClass.superclasses.length !== 0;

    const cssClasses = [!hasSuperClasses ? "pl-2-5rem" : "pl-1rem",
                        selection === inputClass.name ? "selected" : ""].join(" ");

    return (
        <li>
            <div className={cssClasses}
                    onClick={() => {
                        setSelection(inputClass.name)
                        setChildVisibility(!childVisible);
                        console.log(inputClass.name + " has been selected.");
                 }}>
                { hasSuperClasses &&
                    <span className="visibility-indicator">{ childVisible ? "↓" : "→" }</span>
                }
                <span className="class-name">
                    { "□ " + inputClass.name}
                </span>
            </div>
            {
                hasSuperClasses && childVisible &&
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