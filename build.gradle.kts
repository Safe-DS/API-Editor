import com.github.gradle.node.npm.task.NpxTask
import org.jetbrains.kotlin.gradle.tasks.KotlinCompile

// Plugins -------------------------------------------------------------------------------------------------------------

plugins {
    kotlin("jvm") version "1.5.21" apply false
    id("com.github.node-gradle.node") version "3.1.0"
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

    tasks.withType<KotlinCompile>().configureEach {
        kotlinOptions {
            jvmTarget = javaTargetVersion.majorVersion
        }
    }
}


// Tasks ---------------------------------------------------------------------------------------------------------------

tasks.register<NpxTask>("pnpmInstall") {
    group = "pnpm"
    description = "Install node packages from package.json with pnpm"

    inputs.files(
        "package.json",
        "pnpm-lock.yaml",
        "com.larsreimann.api_editor.client/package.json",
        "com.larsreimann.api_editor.client/pnpm-lock.yaml"
    )
    outputs.dirs("node_modules", "com.larsreimann.api_editor.client/node_modules")

    command.set("pnpm")
    args.set(listOf("install"))
}
