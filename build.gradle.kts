// Plugins -------------------------------------------------------------------------------------------------------------

plugins {
    kotlin("jvm") version "1.5.21" apply false
    id("com.github.node-gradle.node") version "3.1.0" apply false
    id("org.jetbrains.kotlin.plugin.serialization") version "1.5.21" apply false
    idea
}

idea {
    module {
        excludeDirs.add(file("gradle"))
    }
}


// Variables -----------------------------------------------------------------------------------------------------------

val javaSourceVersion by extra(JavaVersion.VERSION_16)
val javaTargetVersion by extra(JavaVersion.VERSION_11)


// Subprojects ---------------------------------------------------------------------------------------------------------

subprojects {
    group = "com.larsreimann.api_editor"
    version = "0.0.1"

    repositories {
        mavenCentral()
    }

    tasks.withType<org.jetbrains.kotlin.gradle.tasks.KotlinCompile>().configureEach {
        kotlinOptions {
            jvmTarget = javaTargetVersion.majorVersion
        }
    }
}
