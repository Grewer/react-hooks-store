import React from 'react';
import './App.css';
import {useModal} from "./reducer";
import Count from "./Count";
import TodoList from "./ToDoList";
import PersonInfo from "./personInfo";

function App() {
  const [state] = useModal(['countReducer'])
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
