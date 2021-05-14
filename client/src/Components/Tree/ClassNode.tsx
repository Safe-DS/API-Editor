import React, {useState} from "react";
import PythonClass from "../../model/PythonClass";
import classNames from "classnames";

type ClassNodeProps = {
    inputClass: PythonClass,
    selection: string,
    setSelection: (newValue: string) => void,
}

const ClassNode = ({inputClass, selection, setSelection}: ClassNodeProps) => {
    const [childVisible, setChildVisibility] = useState(false);

    const cssClasses = classNames(
        "pl-2-5rem",
        {
            "selected": selection === inputClass.name,
        }
    );

    return (
        <div className="listItem">
            <div className={cssClasses}
                 onClick={() => {
                     setSelection(inputClass.name)
                     setChildVisibility(!childVisible);
                     console.log(inputClass.name + " has been selected.");
                 }}>
                <span className="class-name">
                    {"□ " + inputClass.name}
                </span>
            </div>
        </div>
    )
};

export default ClassNode;