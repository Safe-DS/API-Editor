rootProject.name = "com.larsreimann.python_api_editor"

pluginManagement {
    repositories {
        gradlePluginPortal()
        // Can be removed once compose-jb supports Kotlin 1.7.0
        maven("https://maven.pkg.jetbrains.space/public/p/compose/dev")
    }
}

include(
    "backend",
    "desktop",
    "gui"
)
