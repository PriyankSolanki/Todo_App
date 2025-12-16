import {FormEvent, useEffect, useState} from "react";
import styles from "./board.module.css";
import { ColumnModel } from "../../models/column";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {faPlus, faRightToBracket} from "@fortawesome/free-solid-svg-icons";
import Column from "../column/column";
import { DndContext, DragEndEvent, DragOverEvent, PointerSensor, closestCorners, useSensor, useSensors, DragOverlay} from "@dnd-kit/core";
import {arrayMove} from "@dnd-kit/sortable";
import {CardModel} from "../../models/card";
import Card from "../card/card";
import CardModal from "../cardModal/cardModal";
import { GET_BOARDS } from "../../queries/board/getBoard";
import {useMutation, useQuery} from "@apollo/client/react";
import {UPDATE_BOARD} from "../../queries/board/updateBoardName";
import {CREATE_COLUMN} from "../../queries/column/createColumn";
import {DELETE_COLUMN} from "../../queries/column/deleteColumn";
import {UPDATE_CARD} from "../../queries/card/updateCard";
import {CREATE_CARD} from "../../queries/card/createCard";
import {DELETE_CARD} from "../../queries/card/deleteCard";
import {REORDER_CARDS} from "../../queries/card/reorderCard";
import {useNavigate} from "react-router-dom";

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

    const userId = Number(localStorage.getItem("userId"));
    const [columns, setColumns] = useState<ColumnModel[]>([]);

    const { data, refetch } = useQuery<GetBoardsData, GetBoardsVars>(GET_BOARDS, {
        variables: { userId },
    });

    const [boardName, setBoardName] = useState("Mon board");
    const [boardId, setBoardId] = useState<number | null>(null);

    const [updateBoard] = useMutation(UPDATE_BOARD, {
        refetchQueries: ["GetBoardsByUser"],
        awaitRefetchQueries: true,
    });

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

    type UpdateCardData = {
        updateCard: { id: number; name: string; description?: string | null; position: number; columnId: number };
    };

    type UpdateCardVars = {
        input: { id: number; name?: string; description?: string; columnId?: number; position?: number };
    };

    const [updateCardMutation] = useMutation<UpdateCardData, UpdateCardVars>(UPDATE_CARD);

    const updateCard = async (columnId: string, cardId: string, title: string, description: string) => {
        let dbId: string | null = null;

        setColumns(prev =>
            prev.map(col => {
                if (col.id !== columnId) return col;
                return {
                    ...col,
                    cards: col.cards.map(c => {
                        if (c.id !== cardId) return c;
                        dbId = c.bdId ?? null;
                        return { ...c, title, description };
                    })
                };
            })
        );

        if (!dbId) return;

        await updateCardMutation({
            variables: { input: { id: Number(dbId), name: title, description } },
        });
        await refetch();
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

    const [reorderCardsMutation] = useMutation(REORDER_CARDS);

    const persistCardsOrder = async (cols: ColumnModel[]) => {
        const items: { id: number; columnId: number; position: number }[] = [];

        for (const col of cols) {
            const colId = Number(col.bdId);
            if (!col.bdId || Number.isNaN(colId)) continue;

            for (let index = 0; index < col.cards.length; index++) {
                const card = col.cards[index];
                const cardId = Number(card.bdId);
                if (!card.bdId || Number.isNaN(cardId)) continue;

                items.push({
                    id: cardId,
                    columnId: colId,
                    position: index,
                });
            }
        }
        if (items.length === 0) return;
        await reorderCardsMutation({ variables: { input: { items } } });
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

        setColumns((prev) => {
            const next = prev.map((col) => {
                if (col.id !== fromColumnId) return col;

                const oldIndex = col.cards.findIndex((c) => c.id === activeId);
                const newIndex = col.cards.findIndex((c) => c.id === overId);

                if (oldIndex === -1 || newIndex === -1) return col;

                return { ...col, cards: arrayMove(col.cards, oldIndex, newIndex) };
            });

            void persistCardsOrder(next);
            return next;
        });

    };

    type CreateCardData = {
        createCard: { id: number; name: string; description?: string | null; position: number };
    };

    type CreateCardVars = {
        input: { columnId: number; name: string; description?: string };
    };
    const [createCardMutation] = useMutation<CreateCardData, CreateCardVars>(CREATE_CARD);

    const addCard = async (columnDndId: string, title: string) => {
        const tmpCardId = `card_tmp_${Date.now()}`;
        let columnDbId: number | null = null;

        setColumns((prev) =>
            prev.map((col) => {
                if (col.id !== columnDndId) return col;

                columnDbId = Number(col.bdId) ?? null;

                return {
                    ...col,
                    cards: [
                        ...col.cards,
                        { id: tmpCardId, bdId: "", title, description: "" },
                    ],
                };
            })
        );

        if (!columnDbId) return;

        const res = await createCardMutation({
            variables: { input: { columnId: columnDbId, name: title, description: "" } },
        });

        const created = res.data?.createCard;
        if (!created) return;

        setColumns((prev) =>
            prev.map((col) => {
                if (col.id !== columnDndId) return col;
                return {
                    ...col,
                    cards: col.cards.map((c) =>
                        c.id === tmpCardId
                            ? {
                                ...c,
                                bdId: created.id.toString(),
                                id: `card_${created.id}`,
                                title: created.name,
                                description: created.description ?? "",
                            }
                            : c
                    ),
                };
            })
        );
    };


    type DeleteCardData = { deleteCard: boolean };
    type DeleteCardVars = { id: number };
    const [deleteCardMutation] = useMutation<DeleteCardData, DeleteCardVars>(DELETE_CARD);
    const deleteCard = async (columnId: string, cardDndId: string) => {
        let dbId: string | null = null;

        setColumns(prev =>
            prev.map(col => {
                if (col.id !== columnId) return col;
                const found = col.cards.find(c => c.id === cardDndId);
                dbId = found?.bdId ?? null;
                return { ...col, cards: col.cards.filter(c => c.id !== cardDndId) };
            })
        );

        if (!dbId) return;

        await deleteCardMutation({ variables: { id: Number(dbId) } });
        await refetch();
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
            variables: { input: { boardId : boardId, name: "Nouvelle colonne", position : columns.length } },
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
    };

    type DeleteColumnData = { deleteColumn: boolean };
    type DeleteColumnVars = { id: number };
    const [deleteColumnMutation] = useMutation<DeleteColumnData, DeleteColumnVars>(DELETE_COLUMN);
    const deleteColumn = async (columnId: string) => {
        const col = columns.find(c => c.id === columnId);
        if (!col?.bdId) {
            setColumns(prev => prev.filter(c => c.id !== columnId));
            return;
        }
        await deleteColumnMutation({ variables: { id: Number(col.bdId) } });
        setColumns(prev => prev.filter(c => c.id !== columnId));
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

        if (!dbId) return;
        await refetch();
    };

    const navigate = useNavigate();
    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("userId");
        navigate("/login");
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
                        await refetch();
                    }}
                />

                <button type="button" className={styles.logoutBtn} onClick={logout}>
                    <span>Déconnexion</span>
                    <FontAwesomeIcon icon={faRightToBracket} />
                </button>
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
