import org.jetbrains.kotlin.gradle.tasks.KotlinCompile

// Plugins -------------------------------------------------------------------------------------------------------------

plugins {
    kotlin("jvm") version "1.5.31" apply false
    kotlin("plugin.serialization") version "1.5.31" apply false
    id("com.github.johnrengelman.shadow") version "7.1.0" apply false
    id("com.github.node-gradle.node") version "3.1.1"
    idea
}

idea {
    module {
        excludeDirs.add(file("gradle"))
        excludeDirs.add(file("node_modules"))
    }
}


// Variables -----------------------------------------------------------------------------------------------------------

val javaSourceVersion by extra(JavaVersion.VERSION_11)
val javaTargetVersion by extra(JavaVersion.VERSION_11)


// Subprojects ---------------------------------------------------------------------------------------------------------

subprojects {
    group = "com.larsreimann.api_editor"
    version = "0.0.1"

    repositories {
        mavenCentral()
    }

    tasks.withType<KotlinCompile>().configureEach {
        kotlinOptions {
            jvmTarget = javaTargetVersion.majorVersion
        }
    }
}
