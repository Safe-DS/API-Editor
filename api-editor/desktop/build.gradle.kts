import org.jetbrains.compose.compose
import org.jetbrains.compose.desktop.application.dsl.TargetFormat
import org.jetbrains.kotlin.gradle.tasks.KotlinCompile

val javaVersion: String by project

// Plugins -------------------------------------------------------------------------------------------------------------

plugins {
    kotlin("jvm")
    id("org.jetbrains.compose")
    id("org.jetbrains.kotlinx.kover")
}

java {
    toolchain {
        languageVersion.set(JavaLanguageVersion.of(javaVersion))
    }
}

tasks.withType<KotlinCompile> {
    kotlinOptions.jvmTarget = javaVersion
}

compose.desktop {
    application {
        mainClass = "com.larsreimann.python_api_editor.MainKt"
        nativeDistributions {
            targetFormats(TargetFormat.Dmg, TargetFormat.Msi, TargetFormat.Deb)
            packageName = "python-api-editor"
            packageVersion = "1.0.0"
        }
    }
}

// Dependencies --------------------------------------------------------------------------------------------------------

dependencies {
    implementation(compose.desktop.currentOs)
    implementation("org.jetbrains.compose.components:components-splitpane:1.3.0")

    testImplementation(kotlin("test"))
    testImplementation("io.kotest:kotest-assertions-core-jvm:5.5.4")
    testImplementation("io.mockk:mockk:1.13.4")
    testImplementation("org.junit.jupiter:junit-jupiter-params:5.9.1")
}

// Tasks ---------------------------------------------------------------------------------------------------------------

tasks.test {
    useJUnitPlatform()
}
