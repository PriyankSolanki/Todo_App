import {CardModel} from "./card";

export type ColumnModel = {
    id: string;
    bdId: string;
    title: string;
    cards: CardModel[];
};