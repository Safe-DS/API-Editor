val ktorVersion: String by project
val kotlinVersion: String by project
val logbackVersion: String by project


// Plugins -------------------------------------------------------------------------------------------------------------

plugins {
    application
    kotlin("jvm")
    id("org.jetbrains.kotlin.plugin.serialization")
}

application {
    mainClass.set("com.larsreimann.api_editor.ApplicationKt")
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
