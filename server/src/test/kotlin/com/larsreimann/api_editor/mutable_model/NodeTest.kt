@file:Suppress("UNUSED_VARIABLE", "unused")

package com.larsreimann.api_editor.mutable_model

import io.kotest.matchers.booleans.shouldBeFalse
import io.kotest.matchers.booleans.shouldBeTrue
import io.kotest.matchers.nulls.shouldBeNull
import io.kotest.matchers.sequences.shouldBeEmpty
import org.junit.jupiter.api.Test

class NodeTest {

    @Test
    fun `isRoot() should be true by default`() {
        Node().isRoot().shouldBeTrue()
    }

    @Test
    fun `isRoot() should indicate whether the node has a parent`() {
        val innerNode = Node()
        val root = object : Node() {
            val child = ContainmentReference(innerNode)
        }

        innerNode.isRoot().shouldBeFalse()
        root.isRoot().shouldBeTrue()
    }

    @Test
    fun `children() should be empty by default`() {
        Node().children().shouldBeEmpty()
    }

    @Test
    fun `release() should set parent and container to null`() {
        val innerNode = Node()
        val root = object : Node() {
            val child = ContainmentReference(innerNode)
        }

        innerNode.release()

        innerNode.parent.shouldBeNull()
        innerNode.container.shouldBeNull()
    }
}
