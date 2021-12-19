@file:Suppress("UNUSED_VARIABLE", "unused")

package com.larsreimann.api_editor.mutable_model

import io.kotest.matchers.sequences.shouldBeEmpty
import io.kotest.matchers.shouldBe
import org.junit.jupiter.api.Test

class TreeNodeTest {

    @Test
    fun `isRoot() should be true by default`() {
        TreeNode().isRoot() shouldBe true
    }

    @Test
    fun `isRoot() should indicate whether the node has a parent`() {
        val innerNode = TreeNode()
        val root = object : TreeNode() {
            val children = ContainmentReference(innerNode)
        }

        innerNode.isRoot() shouldBe false
        root.isRoot() shouldBe true
    }

    @Test
    fun `children() should be empty by default`() {
        TreeNode().children().shouldBeEmpty()
    }

    @Test
    fun `release() should set parent to null`() {
        val innerNode = TreeNode()
        val root = object : TreeNode() {
            val children = ContainmentReference(innerNode)
        }
        innerNode.release()

        innerNode.parent shouldBe null
    }
}
