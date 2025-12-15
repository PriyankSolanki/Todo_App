import { FormEvent, useState } from "react";
import { useMutation } from "@apollo/client/react";
import {useNavigate, Link, Navigate} from "react-router-dom";
import { LOGIN } from "../../queries/auth/auth";
import styles from "./login.module.css";

type LoginData = {
    login: {
        userId: number;
        token: string;
    };
};

type LoginVars = {
    input: {
        login: string;
        password: string;
    };
};

export default function Login() {
    const navigate = useNavigate();

    const [login_, setLogin_] = useState("");
    const [password, setPassword] = useState("");

    const [login, { loading, error }] = useMutation<LoginData, LoginVars>(LOGIN, {
        onCompleted: (data) => {
            localStorage.setItem("token", data.login.token);
            localStorage.setItem("userId", String(data.login.userId));
            navigate("/board");
        },
    });

    const onSubmit = async (e: FormEvent) => {
        e.preventDefault();
        e.stopPropagation();

        await login({
            variables: {
                input: { login: login_.trim(), password },
            },
        });
    };

    if (localStorage.getItem("token")) {
        return <Navigate to="/board" replace />;
    }

    return (
        <div className={styles.page}>
            <div className={styles.card}>
                <h1 className={styles.title}>Connexion</h1>
                <p className={styles.subtitle}>Connecte-toi pour accéder à ton board.</p>

                <form className={styles.form} onSubmit={onSubmit}>
                    <div className={styles.field}>
                        <label htmlFor="login">Identifiant</label>
                        <input
                            id="login"
                            type="text"
                            value={login_}
                            onChange={(e) => setLogin_(e.target.value)}
                            required
                        />
                    </div>

                    <div className={styles.field}>
                        <label htmlFor="password">Mot de passe</label>
                        <input
                            id="password"
                            type="password"
                            autoComplete="current-password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    {error && <div className={styles.error}>{error.message}</div>}

                    <button className={styles.button} type="submit" disabled={loading}>
                        {loading ? "Connexion..." : "Se connecter"}
                    </button>
                </form>

                <div className={styles.footer}>
                    Pas de compte ? <Link to="/signup">Créer un compte</Link>
                </div>
            </div>
        </div>
    );
}