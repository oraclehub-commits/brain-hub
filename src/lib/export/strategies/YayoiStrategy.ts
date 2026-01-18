import { IExportStrategy, ExportTransaction } from '../types';
import template from '@/config/export-templates/yayoi.json';

export class YayoiStrategy implements IExportStrategy {
    generateCSV(transactions: ExportTransaction[]): string {
        const headerRow = template.headers.map(h => `"${h}"`).join(',');

        // 弥生会計インポート形式:
        // 識別フラグ,伝票No,決算,取引日付,借方勘定科目,借方補助科目,借方部門,借方税区分,借方金額,借方消費税額,貸方勘定科目,貸方補助科目,貸方部門,貸方税区分,貸方金額,貸方消費税額,摘要,取引先,期日,タイプ,調整

        const rows = transactions.map(t => {
            const date = new Date(t.date).toISOString().split('T')[0].replace(/-/g, '/'); // YYYY/MM/DD
            const amount = t.amount;
            const description = t.description.replace(/"/g, '""'); // Escape quotes
            const partner = (t.transaction_partner || '').replace(/"/g, '""');

            // Simple Journal Entry Logic (Cash Basis)
            let row = [];

            if (t.type === 'expense') {
                // Expense: Debit(Dr) = Expense, Credit(Cr) = Cash
                // [Flag, No, Settl, Date, DrCat, DrSub, DrDept, DrTax, DrAmt, DrTaxAmt, CrCat, CrSub, CrDept, CrTax, CrAmt, CrTaxAmt, Desc, Partner, Due, Type, Adj]
                row = [
                    '2000', '', 'no', date,
                    t.category, '', '', '課税仕入 10%', amount, '',
                    '現金', '', '', '対象外', amount, '',
                    description, partner, '', '0', 'no'
                ];
            } else {
                // Income: Debit(Dr) = Cash, Credit(Cr) = Income
                row = [
                    '2000', '', 'no', date,
                    '現金', '', '', '対象外', amount, '',
                    t.category, '', '', '課税売上 10%', amount, '',
                    description, partner, '', '0', 'no'
                ];
            }

            return row.map(val => `"${val}"`).join(',');
        });

        return [headerRow, ...rows].join('\n');
    }
}
