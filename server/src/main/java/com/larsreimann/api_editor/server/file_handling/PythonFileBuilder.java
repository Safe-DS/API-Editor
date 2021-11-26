package com.larsreimann.api_editor.server.file_handling;

import java.util.List;

public abstract class PythonFileBuilder {
    public static String indent(String toIndent) {
        String INDENTATION = "    ";
        toIndent = INDENTATION + toIndent;
        toIndent = toIndent.replaceAll("\n", "\n" + INDENTATION);
        toIndent = toIndent.replaceAll("\n"+ INDENTATION + "\n", "\n\n");
        return toIndent;
    }

    public static String listToString(
        List<String> listToConvert, int numberOfNewlines
    ) {
        String delimiter;
        if (numberOfNewlines <= 0) {
            delimiter = "";
        }
        else {
            delimiter = "\n".repeat(numberOfNewlines);
        }
        if (listToConvert == null || listToConvert.isEmpty()) {
            return "";
        }
        else {
            return String.join(delimiter, listToConvert);
        }
    }
}
