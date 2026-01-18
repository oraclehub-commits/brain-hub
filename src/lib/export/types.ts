export interface ExportTransaction {
    id: string;
    type: 'income' | 'expense';
    date: string;
    amount: number;
    category: string;
    description: string;
    tax_rate?: string;
    transaction_partner?: string;
    notes?: string;
}

export interface ExportTemplate {
    name: string;
    encoding: string;
    headers: string[];
}

export interface IExportStrategy {
    generateCSV(transactions: ExportTransaction[]): string;
}
