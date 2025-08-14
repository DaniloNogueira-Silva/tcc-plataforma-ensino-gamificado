export interface IShopItem {
    _id: string;
    name: string;
    url?: string;
    type: string; // COMUM, INCOMUM, RARO, ÉPICO, LENDÁRIO
    label: string; // ex: steel_armor, florest_helmet...
    price: number;
}