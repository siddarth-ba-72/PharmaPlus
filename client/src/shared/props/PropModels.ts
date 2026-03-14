import type { ChangeEvent, FormEvent } from 'react'
import type { LoginRequestDto } from '../dto/LoginRequestDto'
import type { MedicineStockDto } from '../dto/MedicineStockDto'
import type { RegisterRequestDto } from '../dto/RegisterRequestDto'
import type { CartResponseDto } from '../dto/CartDto'
import type { OrderResponseDto, UserOrderResponseDto } from '../dto/OrderDto'
import type { AuthMode } from '../states/StateModels'
import type { AuthField, UpdateUserPayload } from '../storetypes/AuthStoreTypes'

interface AbstractProps {
    loading: boolean
    error: string | null
}

export interface BannerComponentProps {
    isAuthenticated: boolean
    isAdmin: boolean
    isDarkMode: boolean
    username: string | null
    firstName: string | null
    navItems: BannerNavItem[]
    isDropdownOpen: boolean
    onUserNameClick: () => void
    onToggleTheme: () => void
    onDashboardClick: () => void
    onProfileClick: () => void
    onLogoutClick: () => void
}

export interface BannerNavItem {
    label: string
    to: string
}

export interface BannerContainerProps {
    isAuthenticated: boolean
    firstName: string | null
    logoutUser: () => Promise<void>
}

export interface AuthContainerProps {
    username: string | null
    firstName: string | null
    lastName: string | null
    emailId: string | null
    age: number | null
    setAuthField: (field: AuthField, value: string | number | null) => void
    fetchUserProfile: () => void
    loginUser: (request: LoginRequestDto) => Promise<void>
    registerUser: (request: RegisterRequestDto) => Promise<void>
}

export interface AuthComponentProps {
    mode: AuthMode
    userName: string
    password: string
    firstName: string
    lastName: string
    emailId: string
    age: string
    submitting: boolean
    onInputChange: (event: ChangeEvent<HTMLInputElement>) => void
    onToggleMode: () => void
    onLoginSubmit: (event: FormEvent<HTMLFormElement>) => void
    onRegisterSubmit: (event: FormEvent<HTMLFormElement>) => void
}

export interface ProfileComponentProps {
    username: string
    firstName: string
    lastName: string
    emailId: string
    age: string
    isEditing: boolean
    submitting: boolean
    error: string | null
    orders: UserOrderResponseDto[]
    ordersLoading: boolean
    ordersError: string | null
    onEditClick: () => void
    onCancelEdit: () => void
    onInputChange: (event: ChangeEvent<HTMLInputElement>) => void
    onSubmit: (event: FormEvent<HTMLFormElement>) => void
}

export interface ProfileContainerProps extends AbstractProps {
    username: string | null
    firstName: string | null
    lastName: string | null
    emailId: string | null
    age: number | null
    fetchUserProfile: () => void
    updateUser: (payload: UpdateUserPayload) => Promise<void>
}

export interface MedicineListItem {
    medicineName: string
    medicineCode: string
    composition: string
    category: string | null
    price: number | null
    quantity: number | null
}

export interface MedicinesComponentViewProps {
    medicines: MedicineListItem[]
    currentPage: number
    totalPages: number
    pageSize: number
    selectedCategory: string
    categoryOptions: string[]
    minPrice: string
    maxPrice: string
    loading: boolean
    error: string | null
    onCategoryChange: (category: string) => void
    onMinPriceChange: (value: string) => void
    onMaxPriceChange: (value: string) => void
    onClearFilters: () => void
    onPageChange: (nextPage: number) => void
    onMedicineClick: (medicineCode: string) => void
}

export interface MedicineDetailsComponentViewProps {
    medicineStock: MedicineStockDto | null
    isAuthenticated: boolean
    cartQuantity: number
    savingCart: boolean
    loading: boolean
    error: string | null
    onAddToCart: () => void
    onDecreaseFromCart: () => void
    onSaveCart: () => Promise<void>
    onBackClick: () => void
}

export interface CartComponentViewProps {
    items: CartResponseDto[]
    loading: boolean
    error: string | null
    checkoutPhase: 1 | 2 | 3
    deliveryAddress: {
        fullName: string
        phoneNumber: string
        addressLine1: string
        addressLine2: string
        city: string
        state: string
        pincode: string
        landmark: string
    }
    selectedPaymentMethod: 'upi' | 'card' | 'cod'
    paymentDetails: {
        upiId: string
        cardName: string
        cardNumber: string
        cardExpiry: string
        cardCvv: string
    }
    paymentProgress: number
    placingOrder: boolean
    addressValidationError: string | null
    paymentValidationError: string | null
    orderResult: OrderResponseDto | null
    onAddressInputChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
    onPaymentMethodChange: (method: 'upi' | 'card' | 'cod') => void
    onPaymentInputChange: (event: ChangeEvent<HTMLInputElement>) => void
    onProceedToPurchase: () => void
    onContinueToSummary: () => void
    onContinueToPayment: () => void
    onBackToAddress: () => void
    onBackToSummary: () => void
    onPlaceOrder: () => Promise<void>
    onStartNewCheckout: () => void
}
