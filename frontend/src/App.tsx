import React from 'react';
import Login from "./components/auth/login";
import {Navigate, Route, Routes} from "react-router-dom";
import Signup from "./components/auth/signup";
import Board from "./components/board/board";
import ProtectedRoute from "./routes/ProtectedRoutes";

export default function App() {
    return (
        <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route
                path="/board"
                element={
                    <ProtectedRoute>
                        <Board />
                    </ProtectedRoute>
                }
            />
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
    );
}
