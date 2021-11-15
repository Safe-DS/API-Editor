val javaVersion: String by project
val ktorVersion: String by project
val logbackVersion: String by project

// Plugins -------------------------------------------------------------------------------------------------------------

plugins {
    application
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

// Dependencies --------------------------------------------------------------------------------------------------------

dependencies {
    implementation(project(":shared"))

    implementation("ch.qos.logback:logback-classic:$logbackVersion")
    implementation("io.ktor:ktor-serialization:$ktorVersion")
    implementation("io.ktor:ktor-server-core:$ktorVersion")
    implementation("io.ktor:ktor-server-host-common:$ktorVersion")
    implementation("io.ktor:ktor-server-netty:$ktorVersion")

    testImplementation(kotlin("test"))
    testImplementation("io.kotest:kotest-assertions-core-jvm:4.6.3")
    testImplementation("io.ktor:ktor-server-test-host:$ktorVersion")
    testImplementation("io.mockk:mockk:1.12.0")
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
