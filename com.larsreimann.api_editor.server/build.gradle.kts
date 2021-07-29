val ktorVersion: String by project
val kotlinVersion: String by project
val logbackVersion: String by project

val javaSourceVersion: JavaVersion by rootProject.extra
val javaTargetVersion: JavaVersion by rootProject.extra


// Plugins -------------------------------------------------------------------------------------------------------------

plugins {
    application
    kotlin("jvm")
    id("org.jetbrains.kotlin.plugin.serialization")
}

application {
    mainClass.set("com.larsreimann.api_editor.server.ApplicationKt")
}

java {
    sourceCompatibility = javaSourceVersion
    targetCompatibility = javaTargetVersion
}


// Dependencies --------------------------------------------------------------------------------------------------------

dependencies {
    implementation("io.ktor:ktor-server-core:$ktorVersion")
    implementation("io.ktor:ktor-server-host-common:$ktorVersion")
    implementation("io.ktor:ktor-serialization:$ktorVersion")
    implementation("io.ktor:ktor-server-netty:$ktorVersion")
    implementation("ch.qos.logback:logback-classic:$logbackVersion")
    testImplementation("io.ktor:ktor-server-tests:$ktorVersion")
    testImplementation("org.jetbrains.kotlin:kotlin-test:$kotlinVersion")
}

// Tasks ---------------------------------------------------------------------------------------------------------------

tasks.register<Sync>("copyApplication") {
    val buildClientTask = project(":com.larsreimann.api_editor.client").tasks.named("buildClient")
    dependsOn(buildClientTask)

    from(buildClientTask.get().outputs)
    into("src/main/resources/static")
}

tasks {
    processResources {
        dependsOn(named("copyApplication"))
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
