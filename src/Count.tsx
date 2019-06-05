import React from 'react'
import {useModal} from './reducer'


export default function Count(props) {
  const [state, dispatch] = useModal(['countReducer'])
  console.warn('render Count', state, dispatch)

  return <div>
    <button onClick={() => dispatch({type: "ADD", payload: 2})}>+</button>
  </div>
}
