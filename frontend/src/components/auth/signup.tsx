import { FormEvent, useMemo, useState } from "react";
import { useMutation } from "@apollo/client/react";
import {Link, Navigate, useNavigate} from "react-router-dom";
import styles from "./signup.module.css";
import { SIGNUP } from "../../queries/auth/auth";

type SignupData = { signup: { userId: number; token: string } };
type SignupVars = { input: { login: string; password: string } };

export default function Signup() {
    const navigate = useNavigate();

    const [login, setLogin] = useState("");
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");

    const passwordsMatch = useMemo(() => password === confirm, [password, confirm]);

    const [signup, { loading, error }] = useMutation<SignupData, SignupVars>(SIGNUP, {
        onCompleted: (data) => {
            localStorage.setItem("token", data.signup.token);
            localStorage.setItem("userId", String(data.signup.userId));
            navigate("/board");
        },
    });

    const onSubmit = async (e: FormEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!passwordsMatch) return;

        await signup({
            variables: { input: { login: login.trim(), password } },
        });
    };

    if (localStorage.getItem("token")) {
        return <Navigate to="/board" replace />;
    }

    return (
        <div className={styles.page}>
            <div className={styles.card}>
                <h1 className={styles.title}>Inscription</h1>
                <p className={styles.subtitle}>Crée ton compte pour commencer ton board.</p>

                <form className={styles.form} onSubmit={onSubmit}>
                    <div className={styles.field}>
                        <label htmlFor="login">Identifiant</label>
                        <input
                            id="login"
                            type="text"
                            value={login}
                            onChange={(e) => setLogin(e.target.value)}
                            required
                        />
                    </div>

                    <div className={styles.field}>
                        <label htmlFor="password">Mot de passe</label>
                        <input
                            id="password"
                            type="password"
                            autoComplete="new-password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <div className={styles.field}>
                        <label htmlFor="confirm">Confirmer le mot de passe</label>
                        <input
                            id="confirm"
                            type="password"
                            autoComplete="new-password"
                            value={confirm}
                            onChange={(e) => setConfirm(e.target.value)}
                            required
                        />
                    </div>

                    {!passwordsMatch && confirm.length > 0 && (
                        <div className={styles.error}>Les mots de passe ne correspondent pas.</div>
                    )}

                    {error && <div className={styles.error}>{error.message}</div>}

                    <button
                        className={styles.button}
                        type="submit"
                        disabled={loading || !passwordsMatch}
                    >
                        {loading ? "Création..." : "Créer un compte"}
                    </button>
                </form>

                <div className={styles.footer}>
                    Déjà un compte ? <Link to="/login">Se connecter</Link>
                </div>
            </div>
        </div>
    );
}
