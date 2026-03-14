import { useState } from 'react'
import { useUserCartQuery } from '../../shared/queries/CartQueries'
import type { CartComponentViewProps } from '../../shared/props/PropModels'
import { CartComponentView } from './CartComponentView'
import { useSaveCartMutation, cartQueryKeys } from '../../shared/queries/CartQueries'
import { useToastStore } from '../../store/ToastStore'
import { OrderService } from '../../services/OrderService'
import { useQueryClient } from '@tanstack/react-query'
import { useCartStore } from '../../store/CartStore'
import { useNavigate } from 'react-router-dom'

type PaymentMethod = 'upi' | 'card' | 'cod'

type DeliveryAddress = {
    fullName: string
    phoneNumber: string
    addressLine1: string
    addressLine2: string
    city: string
    state: string
    pincode: string
    landmark: string
}

type PaymentDetails = {
    upiId: string
    cardName: string
    cardNumber: string
    cardExpiry: string
    cardCvv: string
}

const orderService = new OrderService()

const initialDeliveryAddress: DeliveryAddress = {
    fullName: '',
    phoneNumber: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pincode: '',
    landmark: '',
}

const initialPaymentDetails: PaymentDetails = {
    upiId: '',
    cardName: '',
    cardNumber: '',
    cardExpiry: '',
    cardCvv: '',
}

const paymentMethodToApiCode: Record<PaymentMethod, string> = {
    upi: 'UPI',
    card: 'CARD',
    cod: 'COD',
}

export const CartComponent = () => {
    const navigate = useNavigate()
    const queryClient = useQueryClient()
    const clearCartStore = useCartStore((state) => state.clear)
    const showToast = useToastStore((state) => state.showToast)
    const userCartQuery = useUserCartQuery()
    const saveCartMutation = useSaveCartMutation()

    const [checkoutPhase, setCheckoutPhase] = useState<1 | 2 | 3>(1)
    const [deliveryAddress, setDeliveryAddress] = useState<DeliveryAddress>(initialDeliveryAddress)
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>('upi')
    const [paymentDetails, setPaymentDetails] = useState<PaymentDetails>(initialPaymentDetails)
    const [paymentProgress, setPaymentProgress] = useState(0)
    const [placingOrder, setPlacingOrder] = useState(false)
    const [addressValidationError, setAddressValidationError] = useState<string | null>(null)
    const [paymentValidationError, setPaymentValidationError] = useState<string | null>(null)
    const [orderResult, setOrderResult] = useState<CartComponentViewProps['orderResult']>(null)

    const validateAddressForm = (): string | null => {
        if (!deliveryAddress.fullName.trim()) {
            return 'Please enter full name for delivery.'
        }
        if (!/^\d{10}$/.test(deliveryAddress.phoneNumber.trim())) {
            return 'Please enter a valid 10-digit phone number.'
        }
        if (!deliveryAddress.addressLine1.trim()) {
            return 'Please enter address line 1.'
        }
        if (!deliveryAddress.city.trim() || !deliveryAddress.state.trim()) {
            return 'Please enter city and state.'
        }
        if (!/^\d{6}$/.test(deliveryAddress.pincode.trim())) {
            return 'Please enter a valid 6-digit pincode.'
        }
        return null
    }

    const validatePaymentDetails = (): string | null => {
        if (selectedPaymentMethod === 'upi' && !/^[\w.-]{2,}@[\w.-]{2,}$/.test(paymentDetails.upiId.trim())) {
            return 'Enter a valid UPI ID.'
        }

        if (selectedPaymentMethod === 'card') {
            if (!paymentDetails.cardName.trim()) {
                return 'Enter card holder name.'
            }

            if (!/^\d{16}$/.test(paymentDetails.cardNumber.replace(/\s+/g, ''))) {
                return 'Enter a valid 16-digit card number.'
            }

            if (!/^(0[1-9]|1[0-2])\/(\d{2})$/.test(paymentDetails.cardExpiry.trim())) {
                return 'Enter card expiry as MM/YY.'
            }

            if (!/^\d{3}$/.test(paymentDetails.cardCvv.trim())) {
                return 'Enter a valid 3-digit CVV.'
            }
        }

        return null
    }

    const clearCartIfStillPresent = async (): Promise<void> => {
        const refreshedCart = await userCartQuery.refetch()
        const cartItems = refreshedCart.data ?? []

        if (cartItems.length === 0) {
            return
        }

        const clearPayload = cartItems.map((item) => ({
            medicineCode: item.medicineCode,
            quantity: 0,
        }))

        await saveCartMutation.mutateAsync(clearPayload)
        await queryClient.invalidateQueries({ queryKey: cartQueryKeys.userCart })
    }

    const placeOrderWithFallbackPaymentType = async () => {
        const primaryCode = paymentMethodToApiCode[selectedPaymentMethod]
        try {
            return await orderService.placeOrder({ paymentTypeCode: primaryCode })
        } catch (error) {
            if (primaryCode === 'UPI') {
                throw error
            }

            return await orderService.placeOrder({ paymentTypeCode: 'UPI' })
        }
    }

    const handleProceedToPurchase = () => {
        if ((userCartQuery.data ?? []).length === 0) {
            showToast({ category: 'warn', message: 'Add items to cart before checkout.' })
            return
        }

        setCheckoutPhase(1)
    }

    const handleContinueToSummary = () => {
        const validationMessage = validateAddressForm()
        if (validationMessage) {
            setAddressValidationError(validationMessage)
            return
        }

        setAddressValidationError(null)
        setCheckoutPhase(2)
    }

    const handleContinueToPayment = () => {
        setCheckoutPhase(3)
        setPaymentValidationError(null)
    }

    const handlePlaceOrder = async (): Promise<void> => {
        if ((userCartQuery.data ?? []).length === 0) {
            showToast({ category: 'warn', message: 'Cart is empty. Please add items and try again.' })
            return
        }

        const paymentValidationMessage = validatePaymentDetails()
        if (paymentValidationMessage) {
            setPaymentValidationError(paymentValidationMessage)
            return
        }

        setPaymentValidationError(null)
        setPlacingOrder(true)
        setPaymentProgress(12)

        try {
            await new Promise((resolve) => setTimeout(resolve, 250))
            setPaymentProgress(40)
            await new Promise((resolve) => setTimeout(resolve, 250))
            setPaymentProgress(72)
            const placedOrder = await placeOrderWithFallbackPaymentType()
            setPaymentProgress(100)

            await queryClient.invalidateQueries({ queryKey: cartQueryKeys.userCart })
            await clearCartIfStillPresent()
            clearCartStore()

            setOrderResult(placedOrder)
            showToast({
                category: 'success',
                message: `Order placed successfully. Order #${placedOrder.orderNumber} | Total Rs. ${placedOrder.totalAmount.toFixed(2)}`,
            })

            navigate('/pharma-plus/my-orders', {
                state: {
                    justPlacedOrder: placedOrder,
                },
            })
        } catch (error) {
            showToast({
                category: 'fail',
                message: error instanceof Error ? error.message : 'Unable to complete payment and place order.',
            })
            setPaymentProgress(0)
        } finally {
            setPlacingOrder(false)
        }
    }

    const handleStartNewCheckout = () => {
        setCheckoutPhase(1)
        setDeliveryAddress(initialDeliveryAddress)
        setSelectedPaymentMethod('upi')
        setPaymentDetails(initialPaymentDetails)
        setAddressValidationError(null)
        setPaymentValidationError(null)
        setPaymentProgress(0)
        setOrderResult(null)
    }

    const cartViewProps: CartComponentViewProps = {
        items: userCartQuery.data ?? [],
        loading: userCartQuery.isLoading,
        error: userCartQuery.error instanceof Error && !/empty/i.test(userCartQuery.error.message)
            ? userCartQuery.error.message
            : null,
        checkoutPhase,
        deliveryAddress,
        selectedPaymentMethod,
        paymentDetails,
        paymentProgress,
        placingOrder,
        addressValidationError,
        paymentValidationError,
        orderResult,
        onAddressInputChange: (event) => {
            const { name, value } = event.target
            setDeliveryAddress((currentState) => ({
                ...currentState,
                [name]: value,
            }))
            if (addressValidationError) {
                setAddressValidationError(null)
            }
        },
        onPaymentMethodChange: (method) => {
            setSelectedPaymentMethod(method)
            setPaymentValidationError(null)
        },
        onPaymentInputChange: (event) => {
            const { name, value } = event.target
            setPaymentDetails((currentState) => ({
                ...currentState,
                [name]: value,
            }))
            if (paymentValidationError) {
                setPaymentValidationError(null)
            }
        },
        onProceedToPurchase: handleProceedToPurchase,
        onContinueToSummary: handleContinueToSummary,
        onContinueToPayment: handleContinueToPayment,
        onBackToAddress: () => setCheckoutPhase(1),
        onBackToSummary: () => setCheckoutPhase(2),
        onPlaceOrder: handlePlaceOrder,
        onStartNewCheckout: handleStartNewCheckout,
    }

    return <CartComponentView {...cartViewProps} />
}
