package com.larsreimann.apiEditor.features.usages

import com.larsreimann.apiEditor.features.api.ClassId
import com.larsreimann.apiEditor.features.api.FunctionId
import com.larsreimann.apiEditor.features.api.ModuleId
import com.larsreimann.apiEditor.features.api.ParameterId

/**
 * @param moduleCounts How often each module is used.
 * @param classCounts How often each class is used.
 * @param functionCounts How often each function is used.
 * @param parameterCounts How often each parameter is used.
 * @param valueCounts How often each parameter is set to a value.
 */
class UsageStore(
    private val moduleCounts: Map<ModuleId, Int> = emptyMap(),
    private val classCounts: Map<ClassId, Int> = emptyMap(),
    private val functionCounts: Map<FunctionId, Int> = emptyMap(),
    private val parameterCounts: Map<ParameterId, Int> = emptyMap(),
    private val valueCounts: Map<ParameterId, Map<String, Int>> = emptyMap(),
) {
    val maxModuleCount by lazy { moduleCounts.values.maxOrNull() ?: 0 }
    val maxClassCount by lazy { classCounts.values.maxOrNull() ?: 0 }
    val maxFunctionCount by lazy { functionCounts.values.maxOrNull() ?: 0 }
    val maxParameterCount by lazy { parameterCounts.values.maxOrNull() ?: 0 }

    fun getModuleCount(moduleId: ModuleId): Int = moduleCounts[moduleId] ?: 0
    fun getClassCount(classId: ClassId): Int = classCounts[classId] ?: 0
    fun getFunctionCount(functionId: FunctionId): Int = functionCounts[functionId] ?: 0
    fun getParameterCount(parameterId: ParameterId): Int = parameterCounts[parameterId] ?: 0
    fun getValueCount(parameterId: ParameterId, value: String): Int = valueCounts[parameterId]?.get(value) ?: 0
}
