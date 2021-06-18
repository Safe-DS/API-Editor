import React, {useState} from 'react';
import './App.css';
import ParameterView from "../ParameterView/ParameterView";
import TreeView from "../TreeView/TreeView";
import PythonFunction from "../../model/PythonFunction";
import PythonParameter from "../../model/PythonParameter";

function App(): JSX.Element {

    const [parameters, setParameters] = useState<PythonParameter[]>([]);
    const [selection, setSelection] = useState<string[]>([]);
    const [selectedFunction, setSelectedFunction] = useState<Nullable<PythonFunction>>(null);

    return (
        <div className="App">
            <TreeView setParameters={setParameters}
                      selection={selection}
                      setSelection={setSelection}
                      setSelectedFunction={setSelectedFunction}
            />
            <ParameterView inputParameters={parameters}
                           selection={selection}
                           selectedFunction={selectedFunction}
            />
        </div>
    );
}

export default App;
