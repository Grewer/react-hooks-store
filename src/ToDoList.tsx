import React, {useState} from 'react'
import Modal from "./reducer";

export default function TodoList() {
  const [inp, setInp] = useState('')
  const [state, dispatch] = Modal.useModal()
  console.warn('render todo List', state)
  return <>
    <input type="text" value={inp} onChange={ev => setInp(ev.target.value)}/>
    <ul>
      {
        state.listReducer.map(v => <li>{v}</li>)
      }
    </ul>
    <button onClick={() => dispatch({type: "ADD_LIST", payload: inp})}>add list</button>
  </>
}