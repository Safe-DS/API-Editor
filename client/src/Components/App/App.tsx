import React from 'react';
import './App.css';
import ParameterView from "../ParameterView/ParameterView";
import TreeView from "../TreeView/TreeView";

function App() {
  return (
    <div className="App">
      <TreeView/>
      <ParameterView/>
    </div>
  );
}

export default App;
