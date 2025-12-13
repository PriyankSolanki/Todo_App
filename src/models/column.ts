import {CardModel} from "./card";

export type ColumnModel = {
    id: string;
    title: string;
    cards: CardModel[];
};