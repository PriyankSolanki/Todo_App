import styles from "./column.module.css";

export type ColumnModel = {
    id: string;
    title: string;
};

type ColumnProps = {
    column: ColumnModel;
    onDelete?: (id: string) => void;
};

export default function Column({ column, onDelete }: ColumnProps) {
    return (
        <section className={styles.column}>
            <header className={styles.header}>
                <h3 className={styles.title}>{column.title}</h3>

                {onDelete && (
                    <button
                        className={styles.iconBtn}
                        onClick={() => onDelete(column.id)}
                        title="Supprimer la colonne"
                        type="button"
                    >
                        ✕
                    </button>
                )}
            </header>

            <div className={styles.body}>
                <p className={styles.empty}>Aucune carte pour le moment</p>
            </div>
        </section>
    );
}
