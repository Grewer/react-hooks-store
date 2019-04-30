import * as React from 'react';
import Modal from "./reducer";

function PersonInfo() {
  const [state, dispatch] = Modal.useModal(['personReducer'])
  console.warn('render person info', state)
  return (<div>
    {JSON.stringify(state.personReducer)}
    <button onClick={() => dispatch({type: "CHANGE_NAME", payload: 'grewer'})}>change name</button>
  </div>);
}

export default React.memo(PersonInfo)
