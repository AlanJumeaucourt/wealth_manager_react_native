export interface InvestmentTransaction {
    id: number;
    user_id: number;
    account_id: number;
    asset_symbol: string;
    asset_name: string;
    activity_type: 'buy' | 'sell' | 'deposit' | 'withdrawal';
    date: string;
    quantity: number;
    unit_price: number;
    fee: number;
    tax: number;
    transaction_related_id?: number;
}
