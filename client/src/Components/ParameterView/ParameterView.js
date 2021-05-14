import React from "react";

const ParameterView = ({parameters}) => {
    let hasName = !!parameters; //&& parameters.name.length !== 0;

    return (

            <div>
                {hasName &&


                    parameters.map(function (parameters) {
                        return (<p key={parameters.name}> {parameters.name}: {parameters.type} </p>)
                    })
                }

            </div>

    )
};

export default ParameterView;

