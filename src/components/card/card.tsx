import styles from "./card.module.css"
import {CardModel} from "../../models/card";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faTrash} from "@fortawesome/free-solid-svg-icons";
import { CSS } from "@dnd-kit/utilities";
import { useSortable } from "@dnd-kit/sortable";

type CardProps = {
    card: CardModel;
    onDelete?: (id: string) => void;
    columnId: string;
    isOverlay?: boolean;
};

export default function Card({ card, onDelete, columnId, isOverlay }: CardProps) {
    const { setNodeRef, attributes, listeners, transform, transition, isDragging } =
        useSortable({
            id: card.id,
            data: { type: "card", cardId: card.id, columnId },
        });

    const style: React.CSSProperties = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging && !isOverlay ? 0 : 1,
        cursor: "grab",
    };

    return (
        <div className={`${styles.card} ${isOverlay ? styles.cardOverlay : ""}`} ref={setNodeRef}  style={style} {...attributes} {...listeners}>
            <span className={styles.title}>{card.title}</span>

            {onDelete && (
                <button
                    className={styles.deleteBtn}
                    onClick={() => onDelete(card.id)}
                    title="Supprimer la carte"
                    type="button"
                >
                    <FontAwesomeIcon icon={faTrash} />
                </button>
            )}

            <p>{card.description}</p>
        </div>
    );
}