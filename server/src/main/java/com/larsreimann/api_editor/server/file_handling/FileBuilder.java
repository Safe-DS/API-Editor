package com.larsreimann.api_editor.server.file_handling;

import java.util.List;

public abstract class FileBuilder {
    /**
     * Returns an indented version of the passed string
     *
     * @param toIndent The string to be indented
     * @return The indented string
     */
    public static String indent(String toIndent) {
        String INDENTATION = "    ";
        toIndent = INDENTATION + toIndent;
        toIndent = toIndent.replaceAll("\n", "\n" + INDENTATION);
        toIndent = toIndent.replaceAll("\n"+ INDENTATION + "\n", "\n\n");
        return toIndent;
    }

    /**
     * Converts a list of strings into a single string separated by the specified
     * number of new lines
     *
     * @param listToConvert The list to be converted to a string
     * @param numberOfNewlines The number of new lines between the joined
     *                         elements of the list
     * @return The string resulting from joining the list elements
     */
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
