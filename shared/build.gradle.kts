val ktorVersion: String by project

// Plugins -------------------------------------------------------------------------------------------------------------

plugins {
    kotlin("multiplatform")
    kotlin("plugin.serialization")
    java
}

repositories {
    mavenCentral()
}

kotlin {
    js(IR) {
        browser()
    }

    jvm {
        withJava()
    }

    sourceSets {
        val commonMain by getting {
            dependencies {
                implementation(kotlin("stdlib-common"))
                implementation("org.jetbrains.kotlinx:kotlinx-serialization-json:1.3.0")
            }
        }
    }
}
