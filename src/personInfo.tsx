import * as React from 'react';
import {useModal} from "./reducer";

function PersonInfo() {
  const [state, dispatch] = useModal(['personReducer'])
  console.warn('render person info', state)
  return (<div>
    {JSON.stringify(state.personReducer)}
    <button onClick={() => dispatch({type: "CHANGE_NAME", payload: 'grewer'})}>change name</button>
  </div>);
}

export default React.memo(PersonInfo)
