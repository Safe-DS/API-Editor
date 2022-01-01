package com.larsreimann.api_editor.mutable_model

import io.kotest.assertions.throwables.shouldNotThrowUnit
import io.kotest.matchers.concurrent.shouldCompleteWithin
import io.kotest.matchers.nulls.shouldBeNull
import io.kotest.matchers.shouldBe
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import java.util.concurrent.TimeUnit

class ContainmentReferenceTest {

    private class Root(child: TreeNode, someOtherChild: TreeNode) : TreeNode() {
        val child = ContainmentReference(child)
        val someOtherChild = ContainmentReference(someOtherChild)
    }

    private lateinit var innerNode: TreeNode
    private lateinit var someOtherInnerNode: TreeNode
    private lateinit var root: Root

    @BeforeEach
    fun resetTestData() {
        innerNode = TreeNode()
        someOtherInnerNode = TreeNode()
        root = Root(innerNode, someOtherInnerNode)
    }

    @Test
    fun `constructor should correctly link initial value`() {
        innerNode.parent shouldBe root
        innerNode.container shouldBe root.child
        root.child.node shouldBe innerNode
    }

    @Test
    fun `setter should work if a new node is passed`() {
        root.child.node = root.someOtherChild.node

        innerNode.parent.shouldBeNull()
        innerNode.container.shouldBeNull()
        root.child.node shouldBe someOtherInnerNode

        someOtherInnerNode.parent shouldBe root
        someOtherInnerNode.container shouldBe root.child
        root.someOtherChild.node.shouldBeNull()
    }

    @Test
    fun `setter should work if null is passed`() {
        root.child.node = null

        innerNode.parent.shouldBeNull()
        innerNode.container.shouldBeNull()
        root.child.node.shouldBeNull()
    }

    @Test
    fun `setter should not recurse infinitely if the same value is passed`() {
        shouldCompleteWithin(1, TimeUnit.SECONDS) {
            shouldNotThrowUnit<StackOverflowError> {
                root.child.node = root.child.node
            }
        }
    }

    @Test
    fun `releaseNode should remove links if a node is passed that is referenced`() {
        root.child.releaseNode(innerNode)

        innerNode.parent.shouldBeNull()
        innerNode.container.shouldBeNull()
        root.child.node.shouldBeNull()
    }

    @Test
    fun `releaseNode should do nothing if a node is passed that is not referenced`() {
        root.child.releaseNode(someOtherInnerNode)

        innerNode.parent shouldBe root
        innerNode.container shouldBe root.child
        root.child.node shouldBe innerNode

        someOtherInnerNode.parent shouldBe root
        someOtherInnerNode.container shouldBe root.someOtherChild
        root.someOtherChild.node shouldBe someOtherInnerNode
    }
}
