import {useEffect, useRef, useState} from "react";
import styles from "./cardModal.module.css";
import { CardModel } from "../../models/card";

type Props = {
    card: CardModel;
    onClose: () => void;
    onSave: (cardId: string, title: string, description: string) => void;
};

export default function CardModal({ card, onClose, onSave }: Props) {
    const [title, setTitle] = useState(card.title);
    const [description, setDescription] = useState(card.description ?? "");

    const submit = () => {
        onSave(card.id, title.trim(), description.trim());
        onClose();
    };

    const textareaRef = useRef<HTMLTextAreaElement | null>(null);

    const autoResize = () => {
        const el = textareaRef.current;
        if (!el) return;
        el.style.height = "0px";
        el.style.height = `${el.scrollHeight}px`;
    };

    useEffect(() => {
        autoResize();
    }, []);

    useEffect(() => {
        autoResize();
    }, [description]);

    return (
        <div className={styles.backdrop}>
            <div className={styles.modal}>
                <div className={styles.header}>
                    <h2 className={styles.title}>Modifier la carte</h2>
                    <button className={styles.closeBtn} onClick={onClose} type="button">✕</button>
                </div>

                <input
                    className={styles.input}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Titre"
                />

                <textarea
                    ref={textareaRef}
                    className={styles.textarea}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Écrivez vos notes !"
                    rows={1}
                />

                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        submit();
                    }}
                >
                <div className={styles.actions}>
                    <button className={styles.primary} type="submit">
                        Enregistrer
                    </button>
                </div>
                </form>
            </div>
        </div>
    );
}
