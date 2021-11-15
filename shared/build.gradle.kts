val javaVersion: String by project

// Plugins -------------------------------------------------------------------------------------------------------------

plugins {
    kotlin("multiplatform")
    kotlin("plugin.serialization")
}

version = "0.0.1"

repositories {
    mavenCentral()
}

kotlin {
    jvm()
    js {
        nodejs()
        binaries.executable()
    }

    sourceSets {
        val commonMain by getting {
            dependencies {
                implementation(kotlin("stdlib-common"))
                implementation("org.jetbrains.kotlinx:kotlinx-serialization-json:1.3.1")
            }
        }
        val commonTest by getting {
            dependencies {
                implementation(kotlin("test-common"))
                implementation(kotlin("test-annotations-common"))
            }
        }
    }
}

java {
    toolchain {
        languageVersion.set(JavaLanguageVersion.of(javaVersion))
    }
}
