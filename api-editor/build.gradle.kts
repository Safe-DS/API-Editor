// Plugins -------------------------------------------------------------------------------------------------------------

plugins {
    idea
    id("org.jetbrains.kotlinx.kover") version "0.7.3"

    // Pin versions for subprojects
    kotlin("jvm") version "1.8.20" apply false
    kotlin("plugin.serialization") version "1.8.20" apply false
    id("com.github.johnrengelman.shadow") version "8.1.1" apply false
    id("com.github.node-gradle.node") version "5.0.0" apply false
    id("org.jetbrains.compose") version "1.4.1" apply false
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
    group = "com.safeds.api-editor"
    version = "1.0.0"

    repositories {
        mavenCentral()
    }
}
