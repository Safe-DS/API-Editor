import com.github.gradle.node.npm.task.NpmTask

// Plugins -------------------------------------------------------------------------------------------------------------

plugins {
    base
    id("com.github.node-gradle.node")
    idea
}

node {
    if (System.getenv("CI") != null) {
        npmInstallCommand.set("ci")
    }
}

idea {
    module {
        sourceDirs.add(file("src"))
        resourceDirs.add(file("public"))

        excludeDirs.add(file("dist"))
        excludeDirs.add(file("node_modules"))
    }
}

// Tasks ---------------------------------------------------------------------------------------------------------------

tasks.register<NpmTask>("buildGUI") {
    dependsOn(tasks.npmInstall)

    inputs.dir("public")
    inputs.dir("src")
    inputs.files(
        "index.html",
        "package.json",
        "tsconfig.json",
        "vite.config.ts"
    )
    outputs.dirs("dist")

    args.set(listOf("run", "build"))
}

tasks.register<NpmTask>("testGUI") {
    dependsOn(tasks.npmInstall)

    inputs.dir("src")
    inputs.files(
        "package.json",
        "tsconfig.json",
    )

    args.set(listOf("run", "test"))
}

tasks {
    build {
        dependsOn(named("buildGUI"))
    }
    check {
        dependsOn(named("testGUI"))
    }
    clean {
        delete(named("buildGUI").get().outputs)
    }
    npmInstall {
        if (System.getenv("CI") != null) {
            args.set(listOf("--prefer-offline", "--no-audit"))
        }
    }
}
