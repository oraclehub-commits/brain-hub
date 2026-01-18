import { IExportStrategy, ExportTransaction } from '../types';

export class StandardStrategy implements IExportStrategy {
    generateCSV(transactions: ExportTransaction[]): string {
        const header = '"Date","Type","Category","Amount","Description","Partner","Notes"';

        const rows = transactions.map(t => {
            const date = t.date;
            const amount = t.amount;
            const description = t.description.replace(/"/g, '""');
            const category = t.category.replace(/"/g, '""');
            const partner = (t.transaction_partner || '').replace(/"/g, '""');
            const notes = (t.notes || '').replace(/"/g, '""');

            return `"${date}","${t.type}","${category}","${amount}","${description}","${partner}","${notes}"`;
        });

        return [header, ...rows].join('\n');
    }
}
