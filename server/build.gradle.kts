val javaVersion: String by project
val ktorVersion: String by project
val logbackVersion: String by project
val xtextVersion: String by project

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

// Dependencies --------------------------------------------------------------------------------------------------------

dependencies {
    implementation("ch.qos.logback:logback-classic:$logbackVersion")
    implementation("io.ktor:ktor-serialization:$ktorVersion")
    implementation("io.ktor:ktor-server-core:$ktorVersion")
    implementation("io.ktor:ktor-server-host-common:$ktorVersion")
    implementation("io.ktor:ktor-server-netty:$ktorVersion")

    // We can later pull this from Maven Central (or some other repo) once published
    implementation(files("lib/de.unibonn.simpleml-1.0.0-SNAPSHOT.jar"))
    implementation("org.eclipse.xtext:org.eclipse.xtext:$xtextVersion")

    testImplementation(kotlin("test"))
    testImplementation("io.kotest:kotest-assertions-core-jvm:5.0.3")
    testImplementation("io.ktor:ktor-server-test-host:$ktorVersion")
    testImplementation("io.mockk:mockk:1.12.2")
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
