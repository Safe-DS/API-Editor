import React, {useState} from "react";

// @ts-ignore
const ParameterNode = ({inputParameters}) => {
    const [childVisible, setChildVisibility] = useState(false);

    return (
        <li>
            <div  onClick={() => {
                setChildVisibility(!childVisible)
                }}>
                {inputParameters?.name}
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
