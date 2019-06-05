## hooks 全局存储解决方案

>针对 react hooks 的新版本解决方案
 
### 一.redux维持原方案
若想要无缝使用原来的 redux,和其配套的中间件 promise,thunk,saga 等等的话
可以使用 `redux-react-hook`
 
github 链接 [redux-react-hook](https://github.com/facebookincubator/redux-react-hook)

一个简单的使用例子:
```typescript jsx
import {useDispatch, useMappedState} from 'redux-react-hook';

export function DeleteButton({index}) {
  // 类似于以前 react-redux 中的 connect 函数
  const mapState = useCallback(
    state => ({
      canDelete: state.todos[index].canDelete,
      name: state.todos[index].name,
    }),
    [index],
  );

  // 获取 redux 的数据
  const {canDelete, name} = useMappedState(mapState);

  // 获取 dispatch 
  const dispatch = useDispatch();
  
  
  // button click handle
  const deleteTodo = useCallback(
    () =>
      dispatch({
        type: 'delete todo',
        index,
      }),
    [index],
  );

  return (
    <button disabled={!canDelete} onClick={deleteTodo}>
      Delete {name}
    </button>
  );
}
```
使用方法和以前一致

### 二.使用 useReducer 与 context

在 index 或 app 中提供全局的 redux 与 dispatch
```typescript jsx
function isPromise(obj) {
  return (
    !!obj &&
    (typeof obj === "object" || typeof obj === "function") &&
    typeof obj.then === "function"
  );
}

function wrapperDispatch(dispatch) {
  // 功能和 redux-promise 相同
  return function (action) {
    isPromise(action.payload) ?
      action.payload.then(v => {
        dispatch({type: action.type, payload: v})
      }).catch((error) => {
        dispatch(Object.assign({}, action, {
          payload: error,
          error: true
        }));
        return Promise.reject(error);
      })
      :
      dispatch(action);
  };
}


function Wrap(props) {
  // 确保在 dispatch 后不会刷新APP组件
  const [state, dispatch] = useReducer(reducers, ReducersValue);
  console.log('render wrap')
  return (<MainContext.Provider value={{state: state, dispatch: wrapperDispatch(dispatch)}}>{props.children}</MainContext.Provider>)
}

function App() {
  console.log('render  App')
  return <Wrap>
    <Router>
      <Switch>
        <Route path="/login" component={Login} exact/>
        <Route path="/" component={MainIndex}/>
      </Switch>
    </Router>
  </Wrap>
}
```

具体使用:
```typescript jsx
function useDispatch() {
  // 获取 dispatch
  const store = useContext(MainContext);
  return store.dispatch;
}

function useStoreState(mapState) {
  //存储 state 且判断是否需要 render
  const {state:store} = useContext(MainContext);

  const mapStateFn = () => mapState(store);

  const [mappedState, setMappedState] = useState(() => mapStateFn());

  const lastRenderedMappedState = useRef();
  // Set the last mapped state after rendering.
  useEffect(() => {
    lastRenderedMappedState.current = mappedState;
  });

  useEffect(
    () => {
     console.log('useEffect ')
      const checkForUpdates = () => {
        const newMappedState = mapStateFn();
        if (!_.isEqual(newMappedState, lastRenderedMappedState.current)) {
          setMappedState(newMappedState);
        }
      };

      checkForUpdates();
    },
    [store, mapState],
  );
  return mappedState
}

// 组件内使用
const ResourceReducer = useStoreState(state => state.ResourceReducer)
const dispatch = useDispatch()
```
他的功能已经足够了,在使用的地方使用函数即可,很方便  
但是也有一些不足的地方是在根源上的,即 context,
在同一个页面中 如果有多个使用 context 的地方    
那么如果一旦dispatch ,其他的所有地方也会触发render 造成资源的浪费,小项目还好,大项目仍旧不可
取  
(除非 react 的 context 函数添加 deps)

### 三.自定义解决方案

原理就是存储一个全局变量 ,通过 import 引入;  
我自己写了一个例子:(本 github)  
想要基础的实现只需要 30+ 行的代码即可
```typescript jsx
class Modal {
  private value: any;
  private prevValue: any;
  private reducers: (state, action) => {};
  private queue: any = [];
  private dispatch: (action) => void;

  constructor(reducers) {
    this.reducers = combineReducers(reducers)
    // combineReducers 来自于 reudx ,可以引入也可以自己写一个(后续我会写一个库,会包含此函数)
    this.value = this.reducers({}, {})
    this.dispatch = action => {
      this.prevValue = this.value;
      this.value = this.reducers(this.value, action)
      this.onDataChange()
    }
  }

  useModal = (deps?: string[]) => {
    const [, setState] = useState(this.value);
    useEffect(() => {
      const index = this.queue.push({setState, deps}); // 订阅
      return () => { // 组件销毁时取消
        this.queue.splice(index - 1, 1);
      };
    }, []);
    return [this.value, this.dispatch]
  }

  onDataChange = () => {
    this.queue.forEach((queue) => {
      const isRender = queue.deps ? queue.deps.some(dep => this.prevValue[dep] !== this.value[dep]) : true
      isRender && queue.setState(this.value)
    });
  }
}
```
// 初始化 reducers
```typescript jsx
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
// 导出 useModal
export const useModal = modal.useModal
```

简单的使用:
```typescript jsx
function Count(props) {
  const [state, dispatch] = useModal(['countReducer'])
  // 非 countReducer 的更新 不会触发此函数 render
  console.warn('render Count', state, dispatch)

  return <div>
    <button onClick={() => dispatch({type: "ADD", payload: 2})}>+</button>
  </div>
}
```

当然你也可以自己写一个,自己想要的方案

### 总结
hooks 的存储方案基本就这 3 类,可以用现成的,也可以使用自己写的方案
