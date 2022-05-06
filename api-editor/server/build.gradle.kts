import org.jetbrains.kotlin.gradle.tasks.KotlinCompile

val javaVersion: String by project

// Plugins -------------------------------------------------------------------------------------------------------------

plugins {
    application
    `java-test-fixtures`
    kotlin("jvm")
    kotlin("plugin.serialization")
    id("com.github.johnrengelman.shadow")
}

application {
    mainClass.set("com.larsreimann.api_editor.server.ApplicationKt")
}

java {
    toolchain {
        languageVersion.set(JavaLanguageVersion.of(javaVersion))
    }
}

tasks.withType<KotlinCompile> {
    kotlinOptions.jvmTarget = javaVersion
}

// Dependencies --------------------------------------------------------------------------------------------------------

val ktorVersion = "2.0.1"

dependencies {
    implementation("ch.qos.logback:logback-classic:1.2.11")
    implementation("io.ktor:ktor-serialization-kotlinx-json:$ktorVersion")
    implementation("io.ktor:ktor-server:$ktorVersion")
    implementation("io.ktor:ktor-server-netty:$ktorVersion")
    implementation("com.larsreimann:modeling-core:2.0.0")

    // We can later pull this from Maven Central (or some other repo) once published
    implementation(files("lib/de.unibonn.simpleml-1.0.0-SNAPSHOT.jar"))
    implementation("org.eclipse.xtext:org.eclipse.xtext:2.26.0")

    testImplementation(kotlin("test"))
    testImplementation("io.kotest:kotest-assertions-core-jvm:5.2.3")
    testImplementation("io.ktor:ktor-server-test-host:$ktorVersion")
    testImplementation("io.ktor:ktor-server-test-host:$ktorVersion")
    testImplementation("io.mockk:mockk:1.12.3")
    testImplementation("org.junit.jupiter:junit-jupiter-params:5.8.2")
}

// Tasks ---------------------------------------------------------------------------------------------------------------

tasks.register<Sync>("copyClient") {
    val buildClientTask = project(":client").tasks.named("buildClient")
    dependsOn(buildClientTask)

    from(buildClientTask.get().outputs)
    into("src/main/resources/static")
}

tasks {
    test {
        useJUnitPlatform()
    }
    clean {
        delete(named("copyClient").get().outputs)
    }
    processResources {
        dependsOn(named("copyClient"))
    }

    // Fix for too long paths in batch start script (see https://stackoverflow.com/a/32089746)
    startScripts {
        doLast {
            val winScriptFile = file(windowsScript)
            val winFileText = winScriptFile.readText()
                .replace(
                    Regex("set CLASSPATH=.*"),
                    "rem original CLASSPATH declaration replaced by:\nset CLASSPATH=%APP_HOME%\\\\lib\\\\*"
                )

            winScriptFile.writeText(winFileText)
        }
    }
}
