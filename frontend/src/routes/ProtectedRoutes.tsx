import {Navigate} from "react-router-dom";
import {JSX} from "react";

type Props = {
    children: JSX.Element;
};

export default function ProtectedRoute({ children }: Props) {
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");

    if (!token || !userId) {
        return <Navigate to="/login" replace />;
    }

    return children;
}
