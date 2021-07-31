import com.github.gradle.node.npm.task.NpmTask

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

tasks.register<NpmTask>("buildClient") {
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

tasks.register<NpmTask>("testClient") {
    dependsOn(tasks.npmInstall)

    inputs.dir("src")
    inputs.files(
        "jest.config.json",
        "package.json",
        "tsconfig.json",
    )

    args.set(listOf("run", "test"))
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
