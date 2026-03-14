import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import type { AuthorizationState } from "../shared/states/StateModels";
import { BannerComponent } from "../components/banner/BannerComponent";
import { AuthComponent } from "../components/auth/AuthComponent";
import { CartComponent } from "../components/cart/CartComponent";
import { AdminAddMedicineComponent } from "../components/admin/AdminAddMedicineComponent";
import { AdminDashboardComponent } from "../components/admin/AdminDashboardComponent";
import { AdminMedicineImportComponent } from "../components/admin/AdminMedicineImportComponent";
import { AdminUpdateMedicineComponent } from "../components/admin/AdminUpdateMedicineComponent";
import { AdminUsersComponent } from "../components/admin/AdminUsersComponent";
import { ProfileComponent } from "../components/profile/ProfileComponent";
import { ToastComponent } from "../components/toast/ToastComponent";
import { MedicineDetailsComponent } from "../components/medicine/MedicineDetailsComponent";
import { MedicinesComponent } from "../components/medicine/MedicinesComponent";
import { MyOrdersComponent } from "../components/order/MyOrdersComponent";
import { HomeComponent } from "../components/home/HomeComponent";

export const PharmaPlusAppComponentView = (props: AuthorizationState) => {

    const { RequiredAuthComponent, RequiredAdminAuthComponent } = props;

    return (
        <BrowserRouter>
            <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-slate-50 to-slate-100 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900">
                <ToastComponent />
                <BannerComponent />
                <section className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6">
                    <Routes>
                        <Route path="/pharma-plus/login" element={<AuthComponent />} />
                        <Route path="/pharma-plus/medicines" element={<MedicinesComponent />} />
                        <Route path="/pharma-plus/home" element={<HomeComponent />} />
                        <Route path="/pharma-plus/medicines/:medicineCode" element={<MedicineDetailsComponent />} />
                        <Route element={RequiredAuthComponent}>
                            <Route path="/pharma-plus/cart" element={<CartComponent />} />
                            <Route path="/pharma-plus/profile" element={<ProfileComponent />} />
                            <Route path="/pharma-plus/my-orders" element={<MyOrdersComponent />} />
                            <Route element={RequiredAdminAuthComponent}>
                                <Route path="/pharma-plus/admin" element={<AdminDashboardComponent />} />
                                <Route path="/pharma-plus/admin/users" element={<AdminUsersComponent />} />
                                <Route path="/pharma-plus/admin/medicines/add" element={<AdminAddMedicineComponent />} />
                                <Route path="/pharma-plus/admin/medicines/update-stock" element={<AdminUpdateMedicineComponent />} />
                                <Route path="/pharma-plus/admin/medicines/import" element={<AdminMedicineImportComponent />} />
                            </Route>
                        </Route>
                        <Route path="*" element={<Navigate to="/pharma-plus/home" replace />} />
                    </Routes>
                </section>
            </div>
        </BrowserRouter>
    )

}
