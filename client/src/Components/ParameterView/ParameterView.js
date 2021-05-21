import ParameterNode from "./ParameterNode";

const ParameterView = ({parameters}) => {

    return (
        <div>
            <ul>
                {
                    parameters?.map(function (parameters) {
                        return (<ParameterNode key={parameters.name} inputParameters={parameters} />)
                    })
                }
            </ul>
        </div>
    )
};

export default ParameterView;

