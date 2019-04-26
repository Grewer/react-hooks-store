import React from 'react';
import {Count} from "./Count";
import Modal from "./reducer";
import TodoList from "./ToDoList";

function App() {
  const [state] = Modal.useModal()
  console.warn('render App', state)
  return (
    <div className="App">
      {state.countReducer}
      <Count/>
      <TodoList/>
    </div>
  );
}

export default App;
