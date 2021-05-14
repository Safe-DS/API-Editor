const FunctionNode = ({inputFunction, setParameters}) => {

    return (
        <li>
            <div onClick={() =>{
                setParameters(inputFunction.parameters);
                console.log(inputFunction.name + " has been selected.");
                //console.log(inputFunction.parameters);
            }
            }>
                {inputFunction.name}
            </div>
        </li>
    );
};

export default FunctionNode;