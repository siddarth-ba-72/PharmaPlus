import type { CartComponentViewProps } from '../../shared/props/PropModels'
import { Link } from 'react-router-dom'

export const CartComponentView = ({ items, loading, error }: CartComponentViewProps) => {
    if (loading) {
        return <section className="cart-wrapper">Loading cart items...</section>
    }

    if (error) {
        return <section className="cart-wrapper error-text">{error}</section>
    }

    return (
        <section className="cart-wrapper">
            <h2>My Cart</h2>
            {items.length === 0 ? (
                <p>Your cart is empty.</p>
            ) : (
                <div className="cart-table-wrapper">
                    <table className="cart-table">
                        <thead>
                            <tr>
                                <th>Medicine</th>
                                <th>Quantity</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((item, index) => (
                                <tr key={`${item.medicineCode}-${index}`}>
                                    <td>
                                        <Link to={`/pharma-plus/medicines/${item.medicineCode}`} className="cart-medicine-link">
                                            {item.medicine}
                                        </Link>
                                    </td>
                                    <td>{item.quantity}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </section>
    )
}
