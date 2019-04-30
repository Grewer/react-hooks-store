import React from 'react';
import './App.css';
import {Count} from "./Count";
import Modal from "./reducer";
import TodoList from "./ToDoList";
import PersonInfo from "./personInfo";

function App() {
  const [state] = Modal.useModal(['countReducer'])
  console.warn('render App', state)
  return (
    <div className="App">
      {state.countReducer}
      <Count/>
      <TodoList/>
      <PersonInfo/>
    </div>
  );
}

export default App;
