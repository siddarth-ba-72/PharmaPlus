import { Component } from 'react'
import { connect } from 'react-redux'
import './styles/App.css'
import { decrement, fetchInitialCounter, increment, incrementByAmount } from './redux-delegate/redux-state-managers/CounterStateManager'
import type { AppDispatch, RootState } from './redux-delegate/redux-store/ReduxStore'
import type { AppProps } from './props/AppProps'

const mapStateToProps = (state: RootState) => ({
    count: state.counter.value,
    loading: state.counter.loading,
    error: state.counter.error,
})

const mapDispatchToProps = (dispatch: AppDispatch) => ({
    fetchInitialCounter: () => dispatch(fetchInitialCounter()),
    increment: () => dispatch(increment()),
    decrement: () => dispatch(decrement()),
    incrementByFive: () => dispatch(incrementByAmount(5)),
})

class PharmaPlusUIApp extends Component<AppProps> {

    componentDidMount(): void {
        this.props.fetchInitialCounter()
    }

    render() {
        const { count, loading, error, increment, decrement, incrementByFive } = this.props

        return (
            <main className="app">
                <h1>PharmaPlus React + TypeScript</h1>
                <p>Redux Toolkit wired to a class component via connect().</p>
                {loading && <p>Loading initial counter from API...</p>}
                {error && <p className="error-text">{error}</p>}
                <h2>Count: {count}</h2>
                <div className="actions">
                    <button type="button" onClick={decrement}>
                        -1
                    </button>
                    <button type="button" onClick={increment}>
                        +1
                    </button>
                    <button type="button" onClick={incrementByFive}>
                        +5
                    </button>
                </div>
            </main>
        )
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(PharmaPlusUIApp)
