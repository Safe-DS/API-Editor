rootProject.name = "com.larsreimann.api_editor"

pluginManagement {
    repositories {
        gradlePluginPortal()
        maven("https://maven.pkg.jetbrains.space/public/p/compose/dev")
    }
}

include(
    "backend",
    "desktop",
    "gui"
)
