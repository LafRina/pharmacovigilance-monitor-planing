import { Navigate, Outlet } from 'react-router-dom';

export default function PrivateRoutes({ allowedRoles, userRole, isRoleLoading }) {
    
    if (isRoleLoading) return <div>Завантаження перевірки доступу...</div>;

    // Якщо користувач взагалі не залогінений
    if (!userRole) {
        return <Navigate to="/login" replace />;
    }

    // Якщо роль не дозволена для цього маршруту
    if (!allowedRoles.includes(userRole)) {
        // Замість логіну шлемо на "домашню" сторінку згідно з роллю
        const homePath = userRole === 'admin' ? '/admindashboard' : '/userdashboard';
        return <Navigate to={homePath} replace />;
    }

    return <Outlet />;
}