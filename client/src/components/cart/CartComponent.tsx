import { useUserCartQuery } from '../../shared/queries/CartQueries'
import type { CartComponentViewProps } from '../../shared/props/PropModels'
import { CartComponentView } from './CartComponentView'

export const CartComponent = () => {
    const userCartQuery = useUserCartQuery()

    const cartViewProps: CartComponentViewProps = {
        items: userCartQuery.data ?? [],
        loading: userCartQuery.isLoading,
        error: userCartQuery.error instanceof Error ? userCartQuery.error.message : null,
    }

    return <CartComponentView {...cartViewProps} />
}
