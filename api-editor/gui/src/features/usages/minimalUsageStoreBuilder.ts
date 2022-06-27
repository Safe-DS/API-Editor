import { UsageCountStore } from './model/UsageCountStore';
import { PythonPackage } from '../packageData/model/PythonPackage';
import { PythonDeclaration } from '../packageData/model/PythonDeclaration';
import { Optional } from '../../common/util/types';
import { PythonParameter } from '../packageData/model/PythonParameter';
import { PythonModule } from '../packageData/model/PythonModule';
import { PythonClass } from '../packageData/model/PythonClass';
import { PythonFunction } from '../packageData/model/PythonFunction';

export const buildMinimalUsagesStoreJson = function (
    usages: UsageCountStore,
    declaration: Optional<PythonDeclaration>,
): string {
    const moduleCounts = new Map<string, number>();
    const classCounts = new Map<string, number>();
    const functionCounts = new Map<string, number>();
    const parameterCounts = new Map<string, number>();
    const valueCounts = new Map<string, Map<string, number>>();

    let current = declaration;
    while (current && !(current instanceof PythonPackage)) {
        if (current instanceof PythonModule) {
            const count = usages.getUsageCountOrNull(current);
            if (count !== null) {
                moduleCounts.set(current.id, count);
            }
        }
        if (current instanceof PythonClass) {
            const count = usages.getUsageCountOrNull(current);
            if (count !== null) {
                classCounts.set(current.id, count);
            }
        }
        if (current instanceof PythonFunction) {
            const count = usages.getUsageCountOrNull(current);
            if (count !== null) {
                functionCounts.set(current.id, count);
            }
        }
        if (current instanceof PythonParameter) {
            const count = usages.getUsageCountOrNull(current);
            if (count !== null) {
                parameterCounts.set(current.id, count);
            }

            const valueCountsForParameter = usages.getValueCountsOrNull(current);
            if (valueCountsForParameter !== null) {
                valueCounts.set(current.id, valueCountsForParameter);
            }
        }
        current = current.parent();
    }

    return JSON.stringify(
        new UsageCountStore(moduleCounts, classCounts, functionCounts, parameterCounts, valueCounts).toJson(),
        null,
        4,
    );
};
