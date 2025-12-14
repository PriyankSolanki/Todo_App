import {FormEvent, useEffect, useState} from "react";
import styles from "./board.module.css";
import { ColumnModel } from "../../models/column";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import Column from "../column/column";
import { DndContext, DragEndEvent, DragOverEvent, PointerSensor, closestCorners, useSensor, useSensors, DragOverlay} from "@dnd-kit/core";
import {arrayMove} from "@dnd-kit/sortable";
import {CardModel} from "../../models/card";
import Card from "../card/card";
import CardModal from "../cardModal/cardModal";
import { GET_BOARDS } from "../../queries/getBoard";
import {useMutation, useQuery} from "@apollo/client/react";
import {UPDATE_BOARD} from "../../queries/updateBoardName";
import {CREATE_COLUMN} from "../../queries/createColumn";

export default function Board() {

    type GqlCard = { id: number; name: string; description?: string | null; position: number };
    type GqlColumn = { id: number; name: string; position: number; cards: GqlCard[] };
    type GqlBoard = { id: number; name: string; columns: GqlColumn[] };

    type CreateColumnData = {
        createColumn: {
            id: number;
            name: string;
            position: number;
        };
    };

    type CreateColumnVars = {
        input: {
            boardId: number;
            name: string;
            position: number;
        };
    };


    type GetBoardsData = { boardsByUser: GqlBoard[] };
    type GetBoardsVars = { userId: number };

    const userId = 1;
    const [columns, setColumns] = useState<ColumnModel[]>([]);

    //donnée de test
    const { data} = useQuery<GetBoardsData, GetBoardsVars>(GET_BOARDS, {
        variables: { userId },
    });

    const [boardName, setBoardName] = useState("Mon board");
    const [boardId, setBoardId] = useState<number | null>(null);
    const [updateBoard] = useMutation(UPDATE_BOARD);

    useEffect(() => {
        if (!data?.boardsByUser?.length) return;

        const board = data.boardsByUser[0];
        setBoardName(board.name);
        setBoardId(board.id);

        const nextColumns: ColumnModel[] = [...board.columns]
            .sort((a, b) => (a.position ?? 0) - (b.position ?? 0) || a.id - b.id)
            .map((col: any) => ({
                id: `col_${col.id}`,
                bdId : String(col.id),
                title: col.name,
                cards: [...col.cards]
                    .sort((a, b) => (a.position ?? 0) - (b.position ?? 0) || a.id - b.id)
                    .map((card: any) => ({
                        id: `card_${card.id}`,
                        bdId : String(card.id),
                        title: card.name,
                        description: card.description ?? "",
                    })),
            }));
        setColumns(nextColumns);
    }, [data]);

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
                        { id: Date.now().toString(),bdId: "" ,title, description: "" },
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

    const [createColumn] = useMutation<CreateColumnData, CreateColumnVars>(CREATE_COLUMN);

    const addColumn = async (e: FormEvent) => {
        e.preventDefault();
        if (!boardId) return;

        const tmpId = `col_${Date.now()}`;

        setColumns((prev) => [
            ...prev,
            { id: tmpId, bdId: "", title: "Nouvelle colonne", cards: [] },
        ]);

        const res = await createColumn({
            variables: { input: { boardId : 1, name: "Nouvelle colonne", position : columns.length } },
        });

        const created = res.data?.createColumn;
        if (!created) return;

        setColumns((prev) =>
            prev.map((c) =>
                c.id === tmpId
                    ? { ...c, bdId: created.id.toString(), id: `col_${created.id}`, title: created.name }
                    : c
            )
        );
        console.log(columns.map(c => ({ id: c.id, bdId: c.bdId })));
    };

    const deleteColumn = (id: string) => {
        setColumns((prev) => prev.filter((c) => c.id !== id));
    };

    const openCard = (card: CardModel, columnId: string) => {
        setSelectedCard({ card, columnId });
    };

    const renameColumn = async (columnId: string, title: string) => {
        let dbId: string | null = null;

        setColumns(prev => {
            const found = prev.find(c => c.id === columnId);
            dbId = found?.bdId ?? null;
            return prev.map(c => c.id === columnId ? { ...c, title } : c);
        });

        if (!dbId) {
            console.log("Skip update: column not persisted yet", columnId);
            return;
        }
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
                <input
                    className={styles.boardTitleInput}
                    value={boardName}
                    onChange={(e) => setBoardName(e.target.value)}
                    maxLength={32}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") (e.currentTarget as HTMLInputElement).blur();
                    }}
                    onBlur={async () => {
                        if (!boardId) return;
                        const trimmed = boardName.trim();
                        if (!trimmed) return;
                        await updateBoard({
                            variables: { input: { id: boardId, name: trimmed } },
                        });
                    }}
                />
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
