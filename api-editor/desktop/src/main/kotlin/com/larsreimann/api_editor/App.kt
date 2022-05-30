package com.larsreimann.api_editor

import androidx.compose.desktop.ui.tooling.preview.Preview
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.padding
import androidx.compose.material.MaterialTheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp

@Composable
@Preview
fun App() {
    MaterialTheme {
        Column(modifier = Modifier.padding(5.dp), verticalArrangement = Arrangement.spacedBy(5.dp)) {
            HeatmapTag(0, 10000)
            HeatmapTag(1, 10000)
            HeatmapTag(10, 10000)
            HeatmapTag(100, 10000)
            HeatmapTag(1000, 10000)
            HeatmapTag(10000, 10000)
        }
    }
}
