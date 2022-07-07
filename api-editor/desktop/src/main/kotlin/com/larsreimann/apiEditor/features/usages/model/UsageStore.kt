package com.larsreimann.apiEditor.features.usages.model

import com.larsreimann.apiEditor.features.ast.model.ClassId
import com.larsreimann.apiEditor.features.ast.model.FunctionId
import com.larsreimann.apiEditor.features.ast.model.ModuleId
import com.larsreimann.apiEditor.features.ast.model.ParameterId

/**
 * @param moduleCounts
 * How often each module is used.
 *
 * @param classCounts
 * How often each class is used.
 *
 * @param functionCounts
 * How often each function is used.
 *
 * @param parameterCounts
 * How often each parameter is used.
 *
 * @param valueCounts
 * How often each parameter is set to a specific value. This also includes the cases where an optional parameter is not
 * set explicitly by the user, so its default value is used implicitly.
 */
class UsageStore(
    private val moduleCounts: Map<ModuleId, Int> = emptyMap(),
    private val classCounts: Map<ClassId, Int> = emptyMap(),
    private val functionCounts: Map<FunctionId, Int> = emptyMap(),
    private val parameterCounts: Map<ParameterId, Int> = emptyMap(),
    private val valueCounts: Map<ParameterId, Map<String, Int>> = emptyMap(),
) {
    fun getModuleCount(moduleId: ModuleId): Int = moduleCounts[moduleId] ?: 0
    fun getClassCount(classId: ClassId): Int = classCounts[classId] ?: 0
    fun getFunctionCount(functionId: FunctionId): Int = functionCounts[functionId] ?: 0
    fun getParameterCount(parameterId: ParameterId): Int = parameterCounts[parameterId] ?: 0
    fun getValueCount(parameterId: ParameterId, value: String): Int = valueCounts[parameterId]?.get(value) ?: 0
}
