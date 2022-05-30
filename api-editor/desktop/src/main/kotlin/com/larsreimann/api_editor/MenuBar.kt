package com.larsreimann.api_editor

import androidx.compose.runtime.Composable
import androidx.compose.ui.window.FrameWindowScope
import androidx.compose.ui.window.MenuBar as ComposeMenuBar

@Composable
fun FrameWindowScope.MenuBar() {
    ComposeMenuBar {
        Menu("File", mnemonic = 'F') {
            Menu("Import", mnemonic = 'I') {
                Item("API", onClick = {})
                Item("Usages", onClick = {})
                Item("Annotations", onClick = {})
            }
            Menu("Export", mnemonic = 'E') {
                Item("Annotations", onClick = {})
            }
            Separator()
            Item("Exit", mnemonic = 'X', onClick = {})
        }
        Menu("Actions", mnemonic = 'A') {
            Item("Generate Adapters", onClick = {})
            Item("Delete All Annotations", onClick = {})
        }
        Menu("View", mnemonic = 'V') {
            Menu("Heatmap") {
                RadioButtonItem("None", selected = true, onClick = {})
                RadioButtonItem("Usages", selected = false, onClick = {})
                RadioButtonItem("Annotations", selected = false, onClick = {})
            }
            Separator()
            CheckboxItem("Dark Mode", checked = false, onCheckedChange = {})
        }
    }
}
