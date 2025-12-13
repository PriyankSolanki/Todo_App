import {FormEvent, useState} from "react";
import styles from "./board.module.css";
import { ColumnModel } from "../../models/column";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import Column from "../column/column";
import { DndContext, DragEndEvent, DragOverEvent, PointerSensor, closestCorners, useSensor, useSensors, DragOverlay} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import {CardModel} from "../../models/card";
import Card from "../card/card";
import CardModal from "../cardModal/cardModal";

export default function Board() {

    //donnée de test
    const [columns, setColumns] = useState<ColumnModel[]>([
        { id: "todo", title: "Todo", cards: [{ id: "c1", title: "Première tâche", description : "test" }]},
    ]);

    const [activeCard, setActiveCard] = useState<CardModel | null>(null);

    const [selectedCard, setSelectedCard] = useState<{
        card: CardModel;
        columnId: string;
    } | null>(null);

    const updateCard = (columnId: string, cardId: string, title: string, description: string) => {
        setColumns((prev) =>
            prev.map((col) =>
                col.id === columnId
                    ? {
                        ...col,
                        cards: col.cards.map((c) =>
                            c.id === cardId ? { ...c, title, description } : c
                        ),
                    }
                    : col
            )
        );
    };

    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

    const handleDragStart = ({ active }: any) => {
        const cardId = String(active.id);

        for (const col of columns) {
            const card = col.cards.find((c) => c.id === cardId);
            if (card) {
                setActiveCard(card);
                break;
            }
        }
    };

    const handleDragOver = ({ active, over }: DragOverEvent) => {
        if (!over) return;

        const activeData = active.data.current as any;
        const overData = over.data.current as any;

        if (activeData?.type !== "card") return;

        const activeCardId = String(active.id);
        const fromColumnId = String(activeData.columnId);

        const toColumnId =
            overData?.type === "column"
                ? String(over.id)
                : String(overData?.columnId);

        if (!toColumnId || fromColumnId === toColumnId) return;

        setColumns((prev) => {
            const next = prev.map((c) => ({ ...c, cards: [...c.cards] }));

            const fromCol = next.find((c) => c.id === fromColumnId);
            const toCol = next.find((c) => c.id === toColumnId);
            if (!fromCol || !toCol) return prev;

            const fromIndex = fromCol.cards.findIndex((c) => c.id === activeCardId);
            if (fromIndex === -1) return prev;

            const [moved] = fromCol.cards.splice(fromIndex, 1);

            const overIndex =
                overData?.type === "card"
                    ? toCol.cards.findIndex((c) => c.id === String(over.id))
                    : -1;

            const insertIndex = overIndex === -1 ? toCol.cards.length : overIndex;

            toCol.cards.splice(insertIndex, 0, moved);
            return next;
        });
    };

    const handleDragEnd = ({ active, over }: DragEndEvent) => {
        if (!over) return;

        const activeData = active.data.current as any;
        const overData = over.data.current as any;

        if (activeData?.type !== "card") return;

        const fromColumnId = String(activeData.columnId);

        if (overData?.type !== "card") return;
        const toColumnId = String(overData.columnId);
        if (fromColumnId !== toColumnId) return;

        const activeId = String(active.id);
        const overId = String(over.id);

        setColumns((prev) =>
            prev.map((col) => {
                if (col.id !== fromColumnId) return col;
                const oldIndex = col.cards.findIndex((c) => c.id === activeId);
                const newIndex = col.cards.findIndex((c) => c.id === overId);
                if (oldIndex === -1 || newIndex === -1) return col;
                return { ...col, cards: arrayMove(col.cards, oldIndex, newIndex) };
            })
        );
    };

    const addCard = (columnId: string, title: string) => {
        setColumns((prev) =>
            prev.map((col) =>
                col.id === columnId ? {
                    ...col,
                    cards: [
                        ...col.cards,
                        { id: Date.now().toString(), title, description: "" },
                    ],
                } : col
            )
        );
    };

    const deleteCard = (columnId: string, cardId: string) => {
        setColumns((prev) =>
            prev.map((col) =>
                col.id === columnId
                    ? {
                        ...col,
                        cards: col.cards.filter((card) => card.id !== cardId),
                    }
                    : col
            )
        );
    };

    const addColumn = (e: FormEvent) => {
        e.preventDefault();
        setColumns((prev) => [...prev, { id: `col_${Date.now()}`, title: "Nouvelle colonne", cards: [] }]);
    };

    const deleteColumn = (id: string) => {
        setColumns((prev) => prev.filter((c) => c.id !== id));
    };

    const openCard = (card: CardModel, columnId: string) => {
        setSelectedCard({ card, columnId });
    };

    const renameColumn = (columnId: string, title: string) => {
        setColumns((prev) =>
            prev.map((col) => (col.id === columnId ? { ...col, title } : col))
        );
    };

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
        >
        <div className={styles.page}>
            <div className={styles.board}>
            <header className={styles.header}>
                <h1 className={styles.h1}>Board</h1>
            </header>

            <main className={styles.columns}>
                {columns.map((col) => (
                    <Column key={col.id} column={col} onDelete={deleteColumn} onAddCard={addCard} onDeleteCard={deleteCard} onOpenCard={openCard} onRename={renameColumn}/>
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
            <DragOverlay>
                {activeCard ? <Card card={activeCard} isOverlay columnId={""} onOpen={openCard}/> : null}
            </DragOverlay>

            {selectedCard && (
                <CardModal
                    card={selectedCard.card}
                    onClose={() => setSelectedCard(null)}
                    onSave={(cardId, title, description) =>
                        updateCard(selectedCard.columnId, cardId, title, description)
                    }
                />
            )}
        </DndContext>

    );
}
