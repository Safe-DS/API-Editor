// Plugins -------------------------------------------------------------------------------------------------------------

plugins {
    id("org.jetbrains.kotlinx.kover") version "0.5.1"
    idea

    // Pin versions for subprojects
    kotlin("jvm") version "1.7.0" apply false
    kotlin("plugin.serialization") version "1.7.0" apply false
    id("com.github.johnrengelman.shadow") version "7.1.2" apply false
    id("com.github.node-gradle.node") version "3.3.0" apply false
    id("org.jetbrains.compose") version "1.2.0-alpha01-dev724" apply false
}

repositories {
    mavenCentral()
    maven("https://maven.pkg.jetbrains.space/public/p/compose/dev")
    maven("https://androidx.dev/storage/compose-compiler/repository/")
    google()
}

idea {
    module {
        excludeDirs.add(file("gradle"))
        excludeDirs.add(file("node_modules"))
    }
}

kover {
    coverageEngine.set(kotlinx.kover.api.CoverageEngine.INTELLIJ)
}

// Subprojects ---------------------------------------------------------------------------------------------------------

subprojects {
    group = "com.larsreimann.api-editor"
    version = "1.0.0"

    repositories {
        mavenCentral()
        maven("https://maven.pkg.jetbrains.space/public/p/compose/dev")
        maven("https://androidx.dev/storage/compose-compiler/repository/")
        google()
    }
}

allprojects {
    configurations.all {
        resolutionStrategy.dependencySubstitution {
            substitute(module("org.jetbrains.compose.compiler:compiler")).apply {
                using(module("androidx.compose.compiler:compiler:1.2.0-dev-k1.7.0-53370d83bb1"))
            }
        }
    }
}
