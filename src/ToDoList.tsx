import React, {useState} from 'react'
import {useModal} from "./reducer";

function TodoList() {
  const [inp, setInp] = useState('')
  const [state, dispatch] = useModal(['listReducer'])
  console.warn('render todo List', state)
  return <>
    <input type="text" value={inp} onChange={ev => setInp(ev.target.value)}/>
    <ul>
      {
        state.listReducer.map(v => <li key={v}>{v}</li>)
      }
    </ul>
    <button onClick={() => dispatch({type: "ADD_LIST", payload: inp})}>add list</button>
  </>
}

export default React.memo(TodoList)
