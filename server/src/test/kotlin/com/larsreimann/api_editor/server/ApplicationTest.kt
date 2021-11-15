package com.larsreimann.api_editor.server

import com.larsreimann.api_editor.shared.model.AnnotatedPythonClass
import com.larsreimann.api_editor.shared.model.AnnotatedPythonFunction
import com.larsreimann.api_editor.shared.model.AnnotatedPythonModule
import com.larsreimann.api_editor.shared.model.AnnotatedPythonPackage
import com.larsreimann.api_editor.shared.model.AnnotatedPythonParameter
import com.larsreimann.api_editor.shared.model.AnnotatedPythonResult
import com.larsreimann.api_editor.shared.model.AttributeAnnotation
import com.larsreimann.api_editor.shared.model.BoundaryAnnotation
import com.larsreimann.api_editor.shared.model.CalledAfterAnnotation
import com.larsreimann.api_editor.shared.model.ComparisonOperator
import com.larsreimann.api_editor.shared.model.ConstantAnnotation
import com.larsreimann.api_editor.shared.model.DefaultBoolean
import com.larsreimann.api_editor.shared.model.DefaultNumber
import com.larsreimann.api_editor.shared.model.DefaultString
import com.larsreimann.api_editor.shared.model.EnumAnnotation
import com.larsreimann.api_editor.shared.model.EnumPair
import com.larsreimann.api_editor.shared.model.GroupAnnotation
import com.larsreimann.api_editor.shared.model.MoveAnnotation
import com.larsreimann.api_editor.shared.model.OptionalAnnotation
import com.larsreimann.api_editor.shared.model.PythonFromImport
import com.larsreimann.api_editor.shared.model.PythonImport
import com.larsreimann.api_editor.shared.model.PythonParameterAssignment
import com.larsreimann.api_editor.shared.model.RenameAnnotation
import com.larsreimann.api_editor.shared.model.RequiredAnnotation
import com.larsreimann.api_editor.shared.model.UnusedAnnotation
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
                modules = arrayOf(
                    AnnotatedPythonModule(
                        name = "test-module",
                        imports = arrayOf(
                            PythonImport(
                                module = "test-import",
                                alias = "test-alias"
                            )
                        ),
                        fromImports = arrayOf(
                            PythonFromImport(
                                module = "test-from-import",
                                declaration = "test-declaration",
                                alias = null
                            )
                        ),
                        classes = arrayOf(
                            AnnotatedPythonClass(
                                name = "test-class",
                                qualifiedName = "test-module.test-class",
                                decorators = arrayOf("test-decorator"),
                                superclasses = arrayOf("test-superclass"),
                                methods = emptyArray(),
                                description = "Lorem ipsum",
                                fullDocstring = "Lorem ipsum",
                                annotations = emptyArray()
                            )
                        ),
                        functions = arrayOf(
                            AnnotatedPythonFunction(
                                name = "test-function",
                                qualifiedName = "test-module.test-function",
                                decorators = arrayOf("test-decorator"),
                                parameters = arrayOf(
                                    AnnotatedPythonParameter(
                                        name = "test-parameter",
                                        defaultValue = "42",
                                        assignedBy = PythonParameterAssignment.NAME_ONLY,
                                        isPublic = true,
                                        typeInDocs = "str",
                                        description = "Lorem ipsum",
                                        annotations = emptyArray()
                                    )
                                ),
                                results = arrayOf(
                                    AnnotatedPythonResult(
                                        name = "test-result",
                                        type = "str",
                                        typeInDocs = "str",
                                        description = "Lorem ipsum",
                                        annotations = emptyArray()
                                    )
                                ),
                                isPublic = true,
                                description = "Lorem ipsum",
                                fullDocstring = "Lorem ipsum",
                                annotations = emptyArray()
                            )
                        ),
                        annotations = emptyArray()
                    )
                ),
                annotations = arrayOf(
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
                        pairs = arrayOf(
                            EnumPair("test-value", "TEST_VALUE")
                        )
                    ),
                    GroupAnnotation(
                        groupName = "test-group",
                        parameters = arrayOf(
                            "test-parameter"
                        )
                    ),
                    MoveAnnotation("test-destination-module"),
                    OptionalAnnotation(DefaultString("bla")),
                    RenameAnnotation("test-new-name"),
                    RequiredAnnotation(),
                    UnusedAnnotation()
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
