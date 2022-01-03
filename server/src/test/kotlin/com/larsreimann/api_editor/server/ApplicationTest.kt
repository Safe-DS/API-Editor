package com.larsreimann.api_editor.server

import com.larsreimann.api_editor.model.AttributeAnnotation
import com.larsreimann.api_editor.model.BoundaryAnnotation
import com.larsreimann.api_editor.model.CalledAfterAnnotation
import com.larsreimann.api_editor.model.ComparisonOperator
import com.larsreimann.api_editor.model.ConstantAnnotation
import com.larsreimann.api_editor.model.DefaultBoolean
import com.larsreimann.api_editor.model.DefaultNumber
import com.larsreimann.api_editor.model.DefaultString
import com.larsreimann.api_editor.model.EnumAnnotation
import com.larsreimann.api_editor.model.EnumPair
import com.larsreimann.api_editor.model.GroupAnnotation
import com.larsreimann.api_editor.model.MoveAnnotation
import com.larsreimann.api_editor.model.OptionalAnnotation
import com.larsreimann.api_editor.model.PureAnnotation
import com.larsreimann.api_editor.model.PythonFromImport
import com.larsreimann.api_editor.model.PythonImport
import com.larsreimann.api_editor.model.PythonParameterAssignment
import com.larsreimann.api_editor.model.RenameAnnotation
import com.larsreimann.api_editor.model.RequiredAnnotation
import com.larsreimann.api_editor.model.SerializablePythonClass
import com.larsreimann.api_editor.model.SerializablePythonFunction
import com.larsreimann.api_editor.model.SerializablePythonModule
import com.larsreimann.api_editor.model.SerializablePythonPackage
import com.larsreimann.api_editor.model.SerializablePythonParameter
import com.larsreimann.api_editor.model.SerializablePythonResult
import com.larsreimann.api_editor.model.UnusedAnnotation
import io.ktor.http.ContentType
import io.ktor.http.HttpHeaders
import io.ktor.http.HttpMethod
import io.ktor.http.HttpStatusCode
import io.ktor.server.testing.handleRequest
import io.ktor.server.testing.setBody
import io.ktor.server.testing.withTestApplication
import kotlinx.serialization.ExperimentalSerializationApi
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import kotlin.test.Test
import kotlin.test.assertEquals

class ApplicationTest {
    @Test
    @ExperimentalSerializationApi
    fun testEcho() {
        withTestApplication({ configureRouting() }) {
            val testPythonPackage = SerializablePythonPackage(
                distribution = "test-distribution",
                name = "test-package",
                version = "1.0.0",
                modules = mutableListOf(
                    SerializablePythonModule(
                        name = "test-module",
                        imports = mutableListOf(
                            PythonImport(
                                module = "test-import",
                                alias = "test-alias"
                            )
                        ),
                        fromImports = mutableListOf(
                            PythonFromImport(
                                module = "test-from-import",
                                declaration = "test-declaration",
                                alias = null
                            )
                        ),
                        classes = mutableListOf(
                            SerializablePythonClass(
                                name = "test-class",
                                qualifiedName = "test-module.test-class",
                                decorators = listOf("test-decorator"),
                                superclasses = listOf("test-superclass"),
                                methods = mutableListOf(),
                                isPublic = true,
                                description = "Lorem ipsum",
                                fullDocstring = "Lorem ipsum",
                                annotations = mutableListOf()
                            )
                        ),
                        functions = mutableListOf(
                            SerializablePythonFunction(
                                name = "test-function",
                                qualifiedName = "test-module.test-function",
                                decorators = listOf("test-decorator"),
                                parameters = mutableListOf(
                                    SerializablePythonParameter(
                                        name = "test-parameter",
                                        qualifiedName = "test-module.test-function.test-parameter",
                                        defaultValue = "42",
                                        assignedBy = PythonParameterAssignment.NAME_ONLY,
                                        isPublic = true,
                                        typeInDocs = "str",
                                        description = "Lorem ipsum",
                                        annotations = mutableListOf()
                                    )
                                ),
                                results = mutableListOf(
                                    SerializablePythonResult(
                                        name = "test-result",
                                        type = "str",
                                        typeInDocs = "str",
                                        description = "Lorem ipsum",
                                        annotations = mutableListOf()
                                    )
                                ),
                                isPublic = true,
                                description = "Lorem ipsum",
                                fullDocstring = "Lorem ipsum",
                                annotations = mutableListOf()
                            )
                        ),
                        annotations = mutableListOf()
                    )
                ),
                annotations = mutableListOf(
                    AttributeAnnotation(DefaultBoolean(false)),
                    BoundaryAnnotation(
                        isDiscrete = false,
                        lowerIntervalLimit = 0.0,
                        lowerLimitType = ComparisonOperator.LESS_THAN_OR_EQUALS,
                        upperIntervalLimit = 1.0,
                        upperLimitType = ComparisonOperator.LESS_THAN
                    ),
                    CalledAfterAnnotation("test-other-function"),
                    ConstantAnnotation(DefaultNumber(0.1)),
                    EnumAnnotation(
                        enumName = "test-enum",
                        pairs = listOf(
                            EnumPair("test-value", "TEST_VALUE")
                        )
                    ),
                    GroupAnnotation(
                        groupName = "test-group",
                        parameters = listOf(
                            "test-parameter"
                        )
                    ),
                    MoveAnnotation("test-destination-module"),
                    OptionalAnnotation(DefaultString("bla")),
                    PureAnnotation,
                    RenameAnnotation("test-new-name"),
                    RequiredAnnotation,
                    UnusedAnnotation
                )
            )

            val requestBody = Json.encodeToString(testPythonPackage)

            handleRequest(HttpMethod.Post, "/api-editor/echo") {
                addHeader(HttpHeaders.ContentType, ContentType.Application.Json.toString())
                setBody(requestBody)
            }.apply {
                assertEquals(HttpStatusCode.OK, response.status())
                assertEquals(requestBody, response.content)
            }
        }
    }
}
