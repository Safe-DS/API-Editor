package com.larsreimann.api_editor.server.file_handling;

import com.larsreimann.api_editor.server.data.AnnotatedPythonModule;
import com.larsreimann.api_editor.server.data.PythonFromImport;
import com.larsreimann.api_editor.server.data.PythonImport;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;

import java.util.Collections;
import java.util.List;

class ImportContentBuilderTest {
    @Test
    void buildAllImportsFromEmptyModuleReturnsFormattedImports() {
        // given
        AnnotatedPythonModule pythonModule = new AnnotatedPythonModule(
            "test-module",
            Collections.emptyList(),
            Collections.emptyList(),
            Collections.emptyList(),
            Collections.emptyList(),
            Collections.emptyList()
        );
        String packageName = "test-name";

        // when
        String formattedImports = ImportContentBuilder.buildAllImports(
            pythonModule, packageName
        );
        String expectedFormattedImports = "import test-name.test-module";

        //then
        Assertions.assertEquals(expectedFormattedImports, formattedImports);
    }

    @Test
    void buildAllImportsWithImportsReturnsFormattedImports() {
        // given
        AnnotatedPythonModule pythonModule = new AnnotatedPythonModule(
            "test-module",
            List.of(
                new PythonImport("imported-module1", "imported-test-module"),
                new PythonImport("imported-module2", null)
            ),
            Collections.emptyList(),
            Collections.emptyList(),
            Collections.emptyList(),
            Collections.emptyList()
        );
        String packageName = "test-name";

        // when
        String formattedImports = ImportContentBuilder.buildAllImports(
            pythonModule, packageName
        );
        String expectedFormattedImports = """
            import test-name.test-module
            import imported-module1 as imported-test-module
            import imported-module2""";

        //then
        Assertions.assertEquals(expectedFormattedImports, formattedImports);
    }

    @Test
    void buildAllImportsWithFromImportsReturnsFormattedImports() {
        // given
        AnnotatedPythonModule pythonModule = new AnnotatedPythonModule(
            "test-module",
            Collections.emptyList(),
            List.of(
                new PythonFromImport(
                    "imported-module1",
                    "function1",
                    "f1"
                ),
                new PythonFromImport(
                    "imported-module2",
                    "function2",
                    null
                )
            ),
            Collections.emptyList(),
            Collections.emptyList(),
            Collections.emptyList()
        );
        String packageName = "test-name";

        // when
        String formattedImports = ImportContentBuilder.buildAllImports(
            pythonModule, packageName
        );
        String expectedFormattedImports = """
            import test-name.test-module
            from imported-module1 import function1 as f1
            from imported-module2 import function2""";

        //then
        Assertions.assertEquals(expectedFormattedImports, formattedImports);
    }

    @Test
    void buildAllImportsWithImportsAndFromImportsReturnsFormattedImports() {
        // given
        AnnotatedPythonModule pythonModule = new AnnotatedPythonModule(
            "test-module",
            List.of(
                new PythonImport("imported-module1", "imported-test-module"),
                new PythonImport("imported-module2", null)
            ),
            List.of(
                new PythonFromImport(
                    "imported-module1",
                    "function1",
                    "f1"
                ),
                new PythonFromImport(
                    "imported-module2",
                    "function2",
                    null
                )
            ),
            Collections.emptyList(),
            Collections.emptyList(),
            Collections.emptyList()
        );
        String packageName = "test-name";

        // when
        String formattedImports = ImportContentBuilder.buildAllImports(
            pythonModule, packageName
        );
        String expectedFormattedImports = """
            import test-name.test-module
            import imported-module1 as imported-test-module
            import imported-module2
            from imported-module1 import function1 as f1
            from imported-module2 import function2""";

        //then
        Assertions.assertEquals(expectedFormattedImports, formattedImports);
    }
}
