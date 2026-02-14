export interface GameItem {
    id: string;
    name: string;
    price: number;
    emoji: string;
    category: 'infrastructure' | 'student' | 'policy' | 'fun';
    maxQuantity?: number;
}

export interface BudgetGameDaily {
    date: string; // YYYY-MM-DD
    initialBalance: number;
    items: GameItem[];
    newsHeadline: string; // Günün "Manşeti" (Flavor text)
}
