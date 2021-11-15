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
        moduleName = "shared-model"
        compilations["main"].packageJson {
            customField("type", "commonjs")
        }

        nodejs {
            useCommonJs()
        }
        binaries.executable()
    }

    sourceSets {
        all {
            languageSettings.optIn("kotlin.RequiresOptIn")
        }

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
