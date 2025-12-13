import { FormEvent, useState } from "react";
import styles from "./board.module.css";
import Column, { ColumnModel } from "../column/column";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";

export default function Board() {

    //donnée de test
    const [columns, setColumns] = useState<ColumnModel[]>([
        { id: "todo", title: "Todo" },
    ]);

    const addColumn = (e: FormEvent) => {
        e.preventDefault();
        const title = "Nouvelle colonne";
        setColumns((prev) => [...prev, { id: `col_${Date.now()}`, title }]);
    };

    const deleteColumn = (id: string) => {
        setColumns((prev) => prev.filter((c) => c.id !== id));
    };

    return (
        <div className={styles.page}>
            <div className={styles.board}>
            <header className={styles.header}>
                <h1 className={styles.h1}>Board</h1>
            </header>

            <main className={styles.columns}>
                {columns.map((col) => (
                    <Column key={col.id} column={col} onDelete={deleteColumn} />
                ))}
                <form onSubmit={addColumn} className={styles.addColumnForm}>

                    <button className={styles.addColumnButton} type="submit">
                        <FontAwesomeIcon icon={faPlus} />
                        <span>Nouvelle colonne</span>
                    </button>
                </form>
            </main>
            </div>
        </div>
    );
}
