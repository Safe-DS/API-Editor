package com.larsreimann.api_editor.server

import com.larsreimann.api_editor.server.data.AnnotatedPythonClass
import com.larsreimann.api_editor.server.data.AnnotatedPythonFunction
import com.larsreimann.api_editor.server.data.AnnotatedPythonModule
import com.larsreimann.api_editor.server.data.AnnotatedPythonPackage
import com.larsreimann.api_editor.server.data.AnnotatedPythonParameter
import com.larsreimann.api_editor.server.data.AnnotatedPythonResult
import com.larsreimann.api_editor.server.data.AttributeAnnotation
import com.larsreimann.api_editor.server.data.BoundaryAnnotation
import com.larsreimann.api_editor.server.data.CalledAfterAnnotation
import com.larsreimann.api_editor.server.data.ComparisonOperator
import com.larsreimann.api_editor.server.data.ConstantAnnotation
import com.larsreimann.api_editor.server.data.DefaultBoolean
import com.larsreimann.api_editor.server.data.DefaultNumber
import com.larsreimann.api_editor.server.data.DefaultString
import com.larsreimann.api_editor.server.data.EnumAnnotation
import com.larsreimann.api_editor.server.data.EnumPair
import com.larsreimann.api_editor.server.data.GroupAnnotation
import com.larsreimann.api_editor.server.data.MoveAnnotation
import com.larsreimann.api_editor.server.data.OptionalAnnotation
import com.larsreimann.api_editor.server.data.PythonFromImport
import com.larsreimann.api_editor.server.data.PythonImport
import com.larsreimann.api_editor.server.data.PythonParameterAssignment
import com.larsreimann.api_editor.server.data.RenameAnnotation
import com.larsreimann.api_editor.server.data.RequiredAnnotation
import com.larsreimann.api_editor.server.data.UnusedAnnotation
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
            val testPythonPackage = AnnotatedPythonPackage(
                distribution = "test-distribution",
                name = "test-package",
                version = "1.0.0",
                modules = listOf(
                    AnnotatedPythonModule(
                        name = "test-module",
                        imports = listOf(
                            PythonImport(
                                module = "test-import",
                                alias = "test-alias"
                            )
                        ),
                        fromImports = listOf(
                            PythonFromImport(
                                module = "test-from-import",
                                declaration = "test-declaration",
                                alias = null
                            )
                        ),
                        classes = listOf(
                            AnnotatedPythonClass(
                                name = "test-class",
                                qualifiedName = "test-module.test-class",
                                decorators = listOf("test-decorator"),
                                superclasses = listOf("test-superclass"),
                                methods = emptyList(),
                                description = "Lorem ipsum",
                                fullDocstring = "Lorem ipsum",
                                annotations = emptyList()
                            )
                        ),
                        functions = listOf(
                            AnnotatedPythonFunction(
                                name = "test-function",
                                qualifiedName = "test-module.test-function",
                                decorators = listOf("test-decorator"),
                                parameters = listOf(
                                    AnnotatedPythonParameter(
                                        name = "test-parameter",
                                        defaultValue = "42",
                                        assignedBy = PythonParameterAssignment.NAME_ONLY,
                                        isPublic = true,
                                        typeInDocs = "str",
                                        description = "Lorem ipsum",
                                        annotations = emptyList()
                                    )
                                ),
                                results = listOf(
                                    AnnotatedPythonResult(
                                        name = "test-result",
                                        type = "str",
                                        typeInDocs = "str",
                                        description = "Lorem ipsum",
                                        annotations = emptyList()
                                    )
                                ),
                                isPublic = true,
                                description = "Lorem ipsum",
                                fullDocstring = "Lorem ipsum",
                                annotations = emptyList()
                            )
                        ),
                        annotations = emptyList()
                    )
                ),
                annotations = listOf(
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
