import React from 'react';
import './App.css';
import ParameterView from "../ParameterView/ParameterView";
import TreeView from "../TreeView/TreeView";

function App() {
    const [parameters, setParameters] = useState([]);

    return (
        <div className="App">
            <TreeView setParameters={setParameters}/>
            <ParameterView inputParameters={parameters}/>
        </div>
    );
}

export default App;
