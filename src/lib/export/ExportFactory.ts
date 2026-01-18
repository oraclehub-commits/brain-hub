import { IExportStrategy } from './types';
import { YayoiStrategy } from './strategies/YayoiStrategy';
import { FreeeStrategy } from './strategies/FreeeStrategy';
import { StandardStrategy } from './strategies/StandardStrategy';

export class ExportFactory {
    static getStrategy(format: string): IExportStrategy {
        switch (format) {
            case 'yayoi':
                return new YayoiStrategy();
            case 'freee':
                return new FreeeStrategy();
            case 'standard':
            default:
                return new StandardStrategy();
        }
    }
}
