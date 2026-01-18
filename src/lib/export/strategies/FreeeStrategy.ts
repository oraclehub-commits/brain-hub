import { IExportStrategy, ExportTransaction } from '../types';
import template from '@/config/export-templates/freee.json';

export class FreeeStrategy implements IExportStrategy {
    generateCSV(transactions: ExportTransaction[]): string {
        const headerRow = template.headers.map(h => `"${h}"`).join(',');

        // freee Import Format:
        // 収支区分,管理番号,発生日,支払期日,取引先,勘定科目,税区分,金額,税計算区分,税額,備考,品目,部門,メモタグ,伝票No,決済口座,決済日,決済金額

        const rows = transactions.map(t => {
            const date = new Date(t.date).toISOString().split('T')[0]; // YYYY-MM-DD
            const amount = t.amount;
            const description = t.description.replace(/"/g, '""');
            const partner = (t.transaction_partner || '').replace(/"/g, '""');
            const notes = (t.notes || '').replace(/"/g, '""');

            const type = t.type === 'income' ? '収入' : '支出';
            const taxType = t.type === 'income' ? '課税売上10%' : '課税仕入10%';

            const row = [
                type, '', date, date, partner, t.category, taxType, amount, '内税', '',
                description, '', '', notes, '', '現金', date, amount
            ];

            return row.map(val => `"${val}"`).join(',');
        });

        return [headerRow, ...rows].join('\n');
    }
}
