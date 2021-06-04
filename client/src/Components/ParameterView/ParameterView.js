import React from "react";

const ParameterView = ({parameters}) => {

    return (
        <div>
            {
                parameters?.map(function (parameters) {
                    return (<p key={parameters.name}> {parameters.name}: {parameters.type} </p>)
                })
            }
        </div>
    )
};

export default ParameterView;

