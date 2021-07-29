import com.github.gradle.node.npm.task.NpxTask

// Plugins -------------------------------------------------------------------------------------------------------------

plugins {
    base
    id("com.github.node-gradle.node")
    idea
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

tasks.register<NpxTask>("testClient") {
    dependsOn(project.rootProject.tasks.named("pnpmInstall"))

    inputs.dir("src")
    inputs.files(
        "jest.config.json",
        "package.json",
        "tsconfig.json",
    )

    command.set("pnpm")
    args.set(listOf("run", "test"))
}

tasks.register<NpxTask>("buildClient") {
    dependsOn(project.rootProject.tasks.named("pnpmInstall"))

    inputs.dir("public")
    inputs.dir("src")
    inputs.files(
        "index.html",
        "package.json",
        "tsconfig.json",
        "vite.config.ts"
    )
    outputs.dirs("dist")

    command.set("pnpm")
    args.set(listOf("run", "build"))
}

tasks {
    build {
        dependsOn(named("buildClient"))
    }
    check {
        dependsOn(named("testClient"))
    }
    clean {
        delete(named("buildClient").get().outputs)
    }
}
