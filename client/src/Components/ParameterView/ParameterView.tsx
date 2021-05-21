import ParameterNode from "./ParameterNode";

// @ts-ignore
const ParameterView = ({parameters}) => {

    return (
        <div className="parameterViewDiv">
            <ul>
                {// @ts-ignore
                    parameters?.map(function (parameters) {
                        return (<ParameterNode key={parameters.name} inputParameters={parameters} />)
                    })
                }
            </ul>
        </div>
    )
};

export default ParameterView;

