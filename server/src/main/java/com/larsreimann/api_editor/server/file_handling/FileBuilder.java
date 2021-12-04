package com.larsreimann.api_editor.server.file_handling;

import java.util.List;

abstract class FileBuilder {
    /**
     * Returns an indented version of the passed string
     *
     * @param toIndent The string to be indented
     * @return The indented string
     */
    String indent(String toIndent) {
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
    String listToString(
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

    /**
     * Returns the number of times a given char appears in an input string
     *
     * @param baseString The input string
     * @param charToCount The char to count
     * @return The number of times the given char appears in the input string
     */
    private int countChars(String baseString, char charToCount) {
        int charCount = 0;
        for (int i = 0; i < baseString.length(); i++) {
            if (baseString.charAt(i) == charToCount) {
                charCount = charCount + 1;
            }
        }
        return charCount;
    }

    /**
     * Converts the given default value string to a formatted version that
     * matches stub file convention
     *
     * @param defaultValue The default value to format
     * @return The formatted default value
     */
    String buildFormattedDefaultValue(
        String defaultValue
    ) {
        String invalid = "###invalid###";
        if (defaultValue.length() < 2) {
            return invalid;
        }
        if (
            defaultValue.charAt(defaultValue.length() - 1)
                == defaultValue.charAt(0)
                && defaultValue.charAt(0) == '\''
                && countChars(defaultValue, '\'') == 2
        ) {
            return defaultValue.replaceAll("'", "\"");
        }
        if (defaultValue.equals("False") || defaultValue.equals("True")) {
            return defaultValue.toLowerCase();
        }
        if (defaultValue.equals("None")) {
            return "null";
        }
        try {
            double numericValue = Double.parseDouble(defaultValue);
            if ((int) numericValue == numericValue) {
                return Integer.toString((int) numericValue);
            }
            return Double.toString(numericValue);
        }
        catch (NumberFormatException e) {
            // do nothing if defaultValue is not numeric
        }
        return invalid;
    }
}
