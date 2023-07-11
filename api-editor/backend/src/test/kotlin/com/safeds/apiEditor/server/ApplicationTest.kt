package com.safeds.apiEditor.server

import com.safeds.apiEditor.model.BoundaryAnnotation
import com.safeds.apiEditor.model.CalledAfterAnnotation
import com.safeds.apiEditor.model.ComparisonOperator
import com.safeds.apiEditor.model.ConstantAnnotation
import com.safeds.apiEditor.model.DefaultNumber
import com.safeds.apiEditor.model.DefaultString
import com.safeds.apiEditor.model.EnumAnnotation
import com.safeds.apiEditor.model.EnumPair
import com.safeds.apiEditor.model.GroupAnnotation
import com.safeds.apiEditor.model.MoveAnnotation
import com.safeds.apiEditor.model.OptionalAnnotation
import com.safeds.apiEditor.model.PureAnnotation
import com.safeds.apiEditor.model.PythonFromImport
import com.safeds.apiEditor.model.PythonImport
import com.safeds.apiEditor.model.PythonParameterAssignment
import com.safeds.apiEditor.model.RemoveAnnotation
import com.safeds.apiEditor.model.RenameAnnotation
import com.safeds.apiEditor.model.RequiredAnnotation
import com.safeds.apiEditor.model.SerializablePythonClass
import com.safeds.apiEditor.model.SerializablePythonFunction
import com.safeds.apiEditor.model.SerializablePythonModule
import com.safeds.apiEditor.model.SerializablePythonPackage
import com.safeds.apiEditor.model.SerializablePythonParameter
import com.safeds.apiEditor.model.SerializablePythonResult
import io.ktor.client.call.body
import io.ktor.client.request.post
import io.ktor.client.request.setBody
import io.ktor.http.ContentType
import io.ktor.http.HttpStatusCode
import io.ktor.http.contentType
import io.ktor.server.testing.testApplication
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import kotlin.test.Test
import kotlin.test.assertEquals

class ApplicationTest {

    @Test
    fun testEcho() {
        testApplication {
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
                                alias = "test-alias",
                            ),
                        ),
                        fromImports = mutableListOf(
                            PythonFromImport(
                                module = "test-from-import",
                                declaration = "test-declaration",
                                alias = null,
                            ),
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
                                annotations = mutableListOf(),
                            ),
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
                                        annotations = mutableListOf(),
                                    ),
                                ),
                                results = mutableListOf(
                                    SerializablePythonResult(
                                        name = "test-result",
                                        type = "str",
                                        typeInDocs = "str",
                                        description = "Lorem ipsum",
                                        annotations = mutableListOf(),
                                    ),
                                ),
                                isPublic = true,
                                description = "Lorem ipsum",
                                fullDocstring = "Lorem ipsum",
                                annotations = mutableListOf(),
                            ),
                        ),
                        annotations = mutableListOf(),
                    ),
                ),
                annotations = mutableListOf(
                    BoundaryAnnotation(
                        isDiscrete = false,
                        lowerIntervalLimit = 0.0,
                        lowerLimitType = ComparisonOperator.LESS_THAN_OR_EQUALS,
                        upperIntervalLimit = 1.0,
                        upperLimitType = ComparisonOperator.LESS_THAN,
                    ),
                    CalledAfterAnnotation("test-other-function"),
                    ConstantAnnotation(DefaultNumber(0.1)),
                    EnumAnnotation(
                        enumName = "test-enum",
                        pairs = listOf(
                            EnumPair("test-value", "TEST_VALUE"),
                        ),
                    ),
                    GroupAnnotation(
                        groupName = "test-group",
                        parameters = mutableListOf(
                            "test-parameter",
                        ),
                    ),
                    MoveAnnotation("test-destination-module"),
                    OptionalAnnotation(DefaultString("bla")),
                    PureAnnotation,
                    RenameAnnotation("test-new-name"),
                    RequiredAnnotation,
                    RemoveAnnotation,
                ),
            )

            val requestBody = Json.encodeToString(testPythonPackage)

            val response = client.post("/api-editor/echo") {
                contentType(ContentType.Application.Json)
                setBody(requestBody)
            }

            assertEquals(HttpStatusCode.OK, response.status)
            assertEquals(requestBody, response.body())
        }
    }
}
