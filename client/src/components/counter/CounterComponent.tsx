import { useCounterStore } from "../../store/CounterStore";
import CounterComponentView from "./CounterComponentView"

export const CounterComponent = () => {

    const counter = useCounterStore((state) => state.count);

    const handleIncrement = useCounterStore((state) => state.increment);
    const handleDecrement = useCounterStore((state) => state.decrement);

    return (
        <CounterComponentView
            count={counter}
            onIncrement={handleIncrement}
            onDecrement={handleDecrement}
        />
    );

};
