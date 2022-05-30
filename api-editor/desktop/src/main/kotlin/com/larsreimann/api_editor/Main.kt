package com.larsreimann.api_editor

import androidx.compose.ui.res.painterResource
import androidx.compose.ui.window.Window
import androidx.compose.ui.window.application

fun main() = application {
    Window(
        onCloseRequest = ::exitApplication,
        title = "API Editor",
        icon = painterResource("icon.svg")
    ) {
        MenuBar()
        App()
    }
}
