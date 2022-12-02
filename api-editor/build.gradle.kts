// Plugins -------------------------------------------------------------------------------------------------------------

plugins {
    idea
    id("org.jetbrains.kotlinx.kover") version "0.6.1"

    // Pin versions for subprojects
    kotlin("jvm") version "1.7.20" apply false
    kotlin("plugin.serialization") version "1.7.22" apply false
    id("com.github.johnrengelman.shadow") version "7.1.2" apply false
    id("com.github.node-gradle.node") version "3.5.0" apply false
    id("org.jetbrains.compose") version "1.2.1" apply false
}

repositories {
    mavenCentral()
}

idea {
    module {
        excludeDirs.add(file("gradle"))
        excludeDirs.add(file("node_modules"))
    }
}

kover {
    koverMerged {
        enable()
        filters {
            projects {
                excludes.add("gui")
            }
        }
    }
}

// Subprojects ---------------------------------------------------------------------------------------------------------

subprojects {
    group = "com.larsreimann.api-editor"
    version = "1.0.0"

    repositories {
        mavenCentral()
    }
}
