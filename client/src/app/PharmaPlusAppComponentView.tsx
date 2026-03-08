import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import type { AuthorizationState } from "../shared/states/StateModels";
import { BannerComponent } from "../components/banner/BannerComponent";
import { AuthComponent } from "../components/auth/AuthComponent";
import { CartComponent } from "../components/cart/CartComponent";
import { AdminAddMedicineComponent } from "../components/admin/AdminAddMedicineComponent";
import { AdminDashboardComponent } from "../components/admin/AdminDashboardComponent";
import { AdminUpdateMedicineComponent } from "../components/admin/AdminUpdateMedicineComponent";
import { AdminUsersComponent } from "../components/admin/AdminUsersComponent";
import { ProfileComponent } from "../components/profile/ProfileComponent";
import { ToastComponent } from "../components/toast/ToastComponent";
import { MedicineDetailsComponent } from "../components/medicine/MedicineDetailsComponent";
import { MedicinesComponent } from "../components/medicine/MedicinesComponent";

export const PharmaPlusAppComponentView = (props: AuthorizationState) => {

    const { RequiredAuthComponent, RequiredAdminAuthComponent } = props;

    return (
        <BrowserRouter>
            <div className="app">
                <ToastComponent />
                <BannerComponent />
                <section className="app-content">
                    <Routes>
                        <Route path="/pharma-plus/login" element={<AuthComponent />} />
                        <Route path="/pharma-plus/medicines" element={<MedicinesComponent />} />
                        <Route path="/pharma-plus/home" element={<section />} />
                        <Route path="/pharma-plus/medicines/:medicineCode" element={<MedicineDetailsComponent />} />
                        <Route element={RequiredAuthComponent}>
                            <Route path="/pharma-plus/cart" element={<CartComponent />} />
                            <Route path="/pharma-plus/profile" element={<ProfileComponent />} />
                            <Route element={RequiredAdminAuthComponent}>
                                <Route path="/pharma-plus/admin" element={<AdminDashboardComponent />} />
                                <Route path="/pharma-plus/admin/users" element={<AdminUsersComponent />} />
                                <Route path="/pharma-plus/admin/medicines/add" element={<AdminAddMedicineComponent />} />
                                <Route path="/pharma-plus/admin/medicines/update-stock" element={<AdminUpdateMedicineComponent />} />
                            </Route>
                        </Route>
                        <Route path="*" element={<Navigate to="/pharma-plus/home" replace />} />
                    </Routes>
                </section>
            </div>
        </BrowserRouter>
    )

}
