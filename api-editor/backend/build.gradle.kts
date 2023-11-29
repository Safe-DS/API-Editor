import com.github.jengelman.gradle.plugins.shadow.tasks.ShadowJar
import org.jetbrains.kotlin.gradle.tasks.KotlinCompile

val javaVersion: String by project

// Plugins -------------------------------------------------------------------------------------------------------------

plugins {
    application
    `java-test-fixtures`
    kotlin("jvm")
    kotlin("plugin.serialization")
    id("com.github.johnrengelman.shadow")
    id("org.jetbrains.kotlinx.kover")
}

application {
    mainClass.set("com.safeds.apiEditor.server.ApplicationKt")
}

java {
    toolchain {
        languageVersion.set(JavaLanguageVersion.of(javaVersion))
    }
}

tasks.withType<KotlinCompile> {
    kotlinOptions.jvmTarget = javaVersion
}

tasks.withType<ShadowJar> {
    archiveFileName.set("api-editor-shadow.jar")
}

// Dependencies --------------------------------------------------------------------------------------------------------

val ktorVersion = "2.3.6"

dependencies {
    implementation("ch.qos.logback:logback-classic:1.4.13")
    implementation("io.ktor:ktor-serialization-kotlinx-json:$ktorVersion")
    implementation("io.ktor:ktor-server:$ktorVersion")
    implementation("io.ktor:ktor-server-netty:$ktorVersion")
    implementation("com.larsreimann:modeling-core:3.1.1")
    implementation("com.larsreimann.safe-ds:safe-ds-core:1.0.0")

    // Required, otherwise serializeToFormattedString does not compile
    implementation("org.eclipse.xtext:org.eclipse.xtext:2.33.0")

    testImplementation(kotlin("test"))
    testImplementation("io.kotest:kotest-assertions-core-jvm:5.6.2")
    testImplementation("io.ktor:ktor-server-test-host:$ktorVersion")
    testImplementation("io.mockk:mockk:1.13.8")
    testImplementation("org.junit.jupiter:junit-jupiter-params:5.10.1")
}

// Tasks ---------------------------------------------------------------------------------------------------------------

tasks.register<Sync>("copyGUI") {
    val buildGUITask = project(":gui").tasks.named("buildGUI")
    dependsOn(buildGUITask)

    from(buildGUITask.get().outputs)
    into("src/main/resources/static")
}

tasks {
    test {
        useJUnitPlatform()
    }
    clean {
        delete(named("copyGUI").get().outputs)
    }
    processResources {
        dependsOn(named("copyGUI"))
    }

    // Fix for too long paths in batch start script (see https://stackoverflow.com/a/32089746)
    startScripts {
        doLast {
            val winScriptFile = file(windowsScript)
            val winFileText = winScriptFile.readText()
                .replace(
                    Regex("set CLASSPATH=.*"),
                    "rem original CLASSPATH declaration replaced by:\nset CLASSPATH=%APP_HOME%\\\\lib\\\\*",
                )

            winScriptFile.writeText(winFileText)
        }
    }
}
