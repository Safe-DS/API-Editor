// Plugins -------------------------------------------------------------------------------------------------------------

plugins {
    base
    idea
}

idea {
    module {
        excludeDirs.add(file("dist"))
        excludeDirs.add(file("node_modules"))
    }
}
