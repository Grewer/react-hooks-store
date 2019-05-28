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
