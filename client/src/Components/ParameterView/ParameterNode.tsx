import React, {useState} from "react";
import "./ParameterView.css";

// @ts-ignore
const ParameterNode = ({inputParameters}) => {
    const [childVisible, setChildVisibility] = useState(false);

    return (
        <li>
            <div onClick={() => {
                setChildVisibility(!childVisible)
                }}>

                <span className="visibility-indicator">{ childVisible ? "▼" : ">" }</span>

                <span className="parameter-name">
                    {inputParameters?.name}
                </span>

            </div>
            <div>
                {
                    childVisible &&
                    <ul>
                        {inputParameters?.docstring}
                    </ul>
                }
            </div>
        </li>
);
};

export default ParameterNode;
