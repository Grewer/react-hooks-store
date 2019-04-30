import React from 'react'
import Modal from './reducer'
console.log(Modal)

export function Count(props) {
  const [state, dispatch] = Modal.useModal(['countReducer'])
  console.warn('render Count',state, dispatch)

  return <div>
    <button onClick={() => dispatch({type: "ADD", payload: 2})}>+</button>
  </div>
}
