import styles from "./column.module.css";
import {useState} from "react";
import Card from "../card/card";
import {ColumnModel} from "../../models/column";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import {CardModel} from "../../models/card";


type ColumnProps = {
    column: ColumnModel;
    onDelete?: (id: string) => void;
    onAddCard: (columnId: string, title: string) => void;
    onDeleteCard: (columnId: string, cardId: string) => void;
    onOpenCard : (card: CardModel, columnId : string ) => void;
    onRename: (columnId: string, title: string) => void;
};

export default function Column({ column, onDelete, onAddCard, onDeleteCard, onOpenCard, onRename }: ColumnProps) {
    const [newCardTitle, setNewCardTitle] = useState("");
    const submit = () => {
        if (!newCardTitle.trim()) return;
        onAddCard(column.id, newCardTitle);
        setNewCardTitle("");
    };
    const max = 16;        // font-size max
    const min = 14;        // font-size min
    const maxLen = 30;     // maxLength
    const startShrink = 24; // à partir de combien on commence à réduire

    const len = column.title.length;

    const fontSize =
        len <= startShrink
            ? max
            : Math.max(
                min,
                max - ((len - startShrink) * (max - min)) / (maxLen - startShrink)
            );
    const { setNodeRef, isOver } = useDroppable({
        id: column.id,
        data: { type: "column", columnId: column.id },
    });
    return (
        <section
            ref={setNodeRef}
            className={styles.column}
            style={{ outline: isOver ? "2px solid rgba(59,130,246,0.7)" : "none" }}
        >

            <SortableContext
                items={column.cards.map((c) => c.id)}
                strategy={verticalListSortingStrategy}
            >
                <header className={styles.header}>
                    <input
                        className={styles.columnTitleInput}
                        value={column.title}
                        onChange={(e) => onRename(column.id, e.target.value)}
                        placeholder="Nom de la colonne"
                        maxLength={maxLen}
                        style={{ fontSize }}
                    />

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

                <div className={styles.cards}>
                    {column.cards.length === 0 ? (
                        <div className={styles.body}>
                            <p className={styles.empty}>Aucune carte pour le moment</p>
                        </div>
                    ) : (
                        column.cards.map((card) => <Card key={card.id} card={card} onDelete={(cardId) => onDeleteCard(column.id, cardId)} columnId={column.id} onOpen={onOpenCard}/>)
                    )}
                </div>

                <input
                    className={styles.input}
                    placeholder="+  Ajouter une carte"
                    value={newCardTitle}
                    onChange={(e) => setNewCardTitle(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && submit()}
                />
            </SortableContext>
        </section>
    );
}
