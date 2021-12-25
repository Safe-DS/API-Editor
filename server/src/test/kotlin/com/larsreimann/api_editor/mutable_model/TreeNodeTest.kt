@file:Suppress("UNUSED_VARIABLE", "unused")

package com.larsreimann.api_editor.mutable_model

import io.kotest.matchers.booleans.shouldBeFalse
import io.kotest.matchers.booleans.shouldBeTrue
import io.kotest.matchers.nulls.shouldBeNull
import io.kotest.matchers.sequences.shouldBeEmpty
import org.junit.jupiter.api.Test

class TreeNodeTest {

    @Test
    fun `isRoot() should be true by default`() {
        TreeNode().isRoot().shouldBeTrue()
    }

    @Test
    fun `isRoot() should indicate whether the node has a parent`() {
        val innerNode = TreeNode()
        val root = object : TreeNode() {
            val child = ContainmentReference(innerNode)
        }

        innerNode.isRoot().shouldBeFalse()
        root.isRoot().shouldBeTrue()
    }

    @Test
    fun `children() should be empty by default`() {
        TreeNode().children().shouldBeEmpty()
    }

    @Test
    fun `release() should set parent and container to null`() {
        val innerNode = TreeNode()
        val root = object : TreeNode() {
            val child = ContainmentReference(innerNode)
        }

        innerNode.release()

        innerNode.parent.shouldBeNull()
        innerNode.container.shouldBeNull()
    }
}
