import React, {useState} from 'react';
import './App.css';
import ParameterView from "../ParameterView/ParameterView";
import TreeView from "../TreeView/TreeView";

function App() {
    const [parameters, setParameters] = useState(null);

    return (
        <div className="App">
            <TreeView />
            <ParameterView parameters={parameters}/>
        </div>
    );
}

export default App;
