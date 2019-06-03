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

