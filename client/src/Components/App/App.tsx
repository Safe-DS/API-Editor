import React, {useState} from 'react';
import './App.css';
import ParameterView from "../ParameterView/ParameterView";
import TreeView from "../TreeView/TreeView";

function App() {

    const [parameters, setParameters] = useState([]);
    const [selection, setSelection ] = useState([]);

    return (
        <div className="App">
            <TreeView setParameters = { setParameters }
                      selection = { selection }
                      setSelection = { setSelection }/>
            <ParameterView inputParameters = { parameters }
                           selection = { selection }
                           setSelection = { setSelection }/>
        </div>
    );
}

export default App;
