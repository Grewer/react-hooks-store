// 组件


import combineReducers from "./combineReducers";
import {useEffect, useState} from "react";

class Modal {
  private value: any;
  private reducers: (state, action) => {};
  private queue: any = [];

  constructor(reducers) {
    this.reducers = combineReducers(reducers)
    this.value = this.reducers({}, {})
  }

  useModal = (deps?:string[]) => {
    if (deps) {
      deps = deps.map(dep => this.value[dep])
    }
    const [, setState] = useState();
    const dispatch = action => {
      this.value = this.reducers(this.value, action)
      this.onDataChange()
    }
    useEffect(() => {
      const index = this.queue.length;
      this.queue.push(setState); // 订阅
      return () => { // 组件销毁时取消
        this.queue.splice(index, 1);
      };
    }, deps);
    return [this.value, dispatch]
  }

  onDataChange = () => {
    const queues = ([] as any).concat(this.queue);
    this.queue.length = 0;
    queues.forEach((setState) => {
      setState(this.value); // 通知所有的组件数据变化
    });
  }
}

export default new Modal({
  countReducer: function (state = 0, action) {
    switch (action.type) {
      case "ADD":
        return state + action.payload || 1
      default:
        return state
    }
  },
  listReducer: function (state = [] as any, action) {
    switch (action.type) {
      case "ADD_LIST":
        state.push(action.payload)
        return [...state]
      default:
        return state
    }
  }
})