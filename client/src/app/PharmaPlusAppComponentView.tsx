import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import type { AuthorizationState } from "../shared/states/StateModels";
import { BannerComponent } from "../components/banner/BannerComponent";
import { CounterComponent } from "../components/counter/CounterComponent";
import { AuthComponent } from "../components/auth/AuthComponent";
import { ProfileComponent } from "../components/profile/ProfileComponent";

export const PharmaPlusAppComponentView = (props: AuthorizationState) => {

    const { RequiredAuthComponent, RequiredAdminAuthComponent } = props;

    return (
        <BrowserRouter>
            <div className="app">
                <BannerComponent />
                <section className="app-content">
                    <Routes>
                        <Route path="/pharma-plus/home" element={<CounterComponent />} />
                        <Route path="/pharma-plus/login" element={<AuthComponent />} />
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
