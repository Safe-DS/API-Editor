package com.larsreimann.apiEditor

import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.window.Window
import androidx.compose.ui.window.application
import com.larsreimann.apiEditor.app.Content
import com.larsreimann.apiEditor.app.MenuBar
import com.larsreimann.apiEditor.app.model.AppSlice
import java.util.ResourceBundle

private val labels = ResourceBundle.getBundle("i18n.labels")

fun main() = application {
    val appSlice by remember { mutableStateOf(AppSlice()) }

    Window(
        onCloseRequest = ::exitApplication,
        title = labels.getString("App.Window.Title"),
        icon = painterResource("img/icon.svg")
    ) {
        MenuBar(appSlice.settingsSlice)
        Content(appSlice)
    }
}
