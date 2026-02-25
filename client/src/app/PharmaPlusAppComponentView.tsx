import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import type { AuthorizationState } from "../shared/states/StateModels";
import { BannerComponent } from "../components/banner/BannerComponent";
import { AuthComponent } from "../components/auth/AuthComponent";
import { ProfileComponent } from "../components/profile/ProfileComponent";
import { ToastComponent } from "../components/toast/ToastComponent";
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
                        <Route path="/pharma-plus/home" element={<>Hello World</>} />
                        <Route element={RequiredAuthComponent}>
                            <Route path="/pharma-plus/profile" element={<ProfileComponent />} />
                            <Route element={RequiredAdminAuthComponent}>
                                {/* TODO : Admin pages to come in future */}
                            </Route>
                        </Route>
                        <Route path="*" element={<Navigate to="/pharma-plus/home" replace />} />
                    </Routes>
                </section>
            </div>
        </BrowserRouter>
    )

}
