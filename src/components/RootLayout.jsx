import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";

export default function RootLayout({user, userRole, isRoleLoading}){
    console.log("ROOT LAYOUT ПРИЙНЯВ:", userRole); 
    
    return(
        <div className="app-layout" style={{ display: 'flex' }}>
            <Sidebar userEmail={user?.email} userRole={userRole} isRoleLoading={isRoleLoading}/>
            <main className="main-content" style={{ flex: 1, marginLeft: '280px' }}>
                <Outlet context={{ user, userRole }}/>
            </main>
        </div>
    );
}