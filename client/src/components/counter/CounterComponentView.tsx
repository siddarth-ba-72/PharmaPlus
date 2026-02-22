
import type { CounterComponentProps } from '../../shared/props/PropModels';

const CounterComponentView = (
    props: CounterComponentProps
) => {

    const { count } = props;

    return (
        <div>
            <h1>Counter Component</h1>
            <div>
                Counter : {count}
            </div>
            <button onClick={props.onIncrement}>Increment</button>
            <button onClick={props.onDecrement}>Decrement</button>
        </div>
    );
};

export default CounterComponentView;
