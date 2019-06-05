// 组件
import combineReducers from "./combineReducers";
import {useEffect, useState} from "react";

class Modal {
  private value: any;
  private prevValue: any;
  private reducers: (state, action) => {};
  private queue: any = [];
  private dispatch: (action) => void;

  constructor(reducers) {
    this.reducers = combineReducers(reducers)
    this.value = this.reducers({}, {})
    this.dispatch = action => {
      console.log('dispatch func run', this.value)
      this.prevValue = this.value;
      this.value = this.reducers(this.value, action)
      this.onDataChange()
    }
  }

  useModal = (deps?: string[]) => {
    const [, setState] = useState(this.value);
    useEffect(() => {
      console.warn('trigger ueEffect')
      const index = this.queue.push({setState, deps}); // 订阅
      return () => { // 组件销毁时取消
        console.error('组件销毁', index)
        this.queue.splice(index - 1, 1);
      };
    }, []);
    return [this.value, this.dispatch]
  }

  onDataChange = () => {
    console.warn('on data change 触发', this.queue)
    this.queue.forEach((queue) => {
      const isRender = queue.deps ? queue.deps.some(dep => this.prevValue[dep] !== this.value[dep]) : true
      console.warn('isRender', isRender, this.prevValue, this.value)
      isRender && queue.setState(this.value)
    });
  }
}

const modal = new Modal({
  countReducer: function (state = 0, action) {
    console.log('count Reducer', state, action)
    switch (action.type) {
      case "ADD":
        console.log('trigger')
        return state + action.payload || 1
      default:
        return state
    }
  },
  listReducer: function (state = [] as any, action) {
    console.log('list Reducer', state, action)
    switch (action.type) {
      case "ADD_LIST":
        console.log('trigger')
        state.push(action.payload)
        return [...state]
      default:
        return state
    }
  },
  personReducer: function (state = {name: 'lll', age: 18} as any, action) {
    console.log('person Reducer', state, action)
    switch (action.type) {
      case "CHANGE_NAME":
        return Object.assign({}, state, {name: action.payload})
      default:
        return state
    }
  }
})

export const useModal = modal.useModal
