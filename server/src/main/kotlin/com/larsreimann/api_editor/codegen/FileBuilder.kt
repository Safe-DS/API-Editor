package com.larsreimann.api_editor.codegen

/**
 * Returns an indented version of the passed string
 *
 * @param toIndent The string to be indented
 * @return The indented string
 */
fun indent(toIndent: String): String {
    return toIndent.prependIndent("    ")
}

/**
 * Converts a list of strings into a single string separated by the specified
 * number of new lines
 *
 * @param listToConvert    The list to be converted to a string
 * @param numberOfNewlines The number of new lines between the joined
 * elements of the list
 * @return The string resulting from joining the list elements
 */
fun listToString(listToConvert: List<String>, numberOfNewlines: Int): String {
    return listToConvert.joinToString(separator = "\n".repeat(numberOfNewlines))
}
