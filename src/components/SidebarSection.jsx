import { NavLink } from "react-router-dom";

export default function SidebarSection({to, icon, children}){
    return(
        <NavLink to={to} className={({isActive})=> isActive ? 'nav-item active' : 'nav-item'}>
            {icon && <img src={icon} alt="" className="nav-icon-img"/>}
            <span className="nav-text">{children}</span>
        </NavLink>
    );
}