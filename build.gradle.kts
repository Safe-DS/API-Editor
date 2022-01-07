// Plugins -------------------------------------------------------------------------------------------------------------

plugins {
    id("org.jetbrains.kotlinx.kover") version "0.4.4"
    idea

    // Pin versions for subprojects
    kotlin("jvm") version "1.6.10" apply false
    kotlin("plugin.serialization") version "1.6.10" apply false
    id("com.github.johnrengelman.shadow") version "7.1.2" apply false
    id("com.github.node-gradle.node") version "3.1.1" apply false
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


// Subprojects ---------------------------------------------------------------------------------------------------------

subprojects {
    group = "com.larsreimann.api_editor"
    version = "0.0.1"

    repositories {
        mavenCentral()
    }
}
