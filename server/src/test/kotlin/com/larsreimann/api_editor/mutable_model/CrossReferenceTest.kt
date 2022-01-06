@file:Suppress("unused")

package com.larsreimann.api_editor.mutable_model

import io.kotest.matchers.booleans.shouldBeFalse
import io.kotest.matchers.booleans.shouldBeTrue
import io.kotest.matchers.sequences.shouldBeEmpty
import io.kotest.matchers.sequences.shouldContainExactly
import io.kotest.matchers.shouldBe
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test

class CrossReferenceTest {

    private class Root(child: Node) : Node() {
        var child by ContainmentReference(child)
    }

    private lateinit var innerNode: Node
    private lateinit var someOtherInnerNode: Node
    private lateinit var root: Root
    private lateinit var crossReference: Node.CrossReference<Node>

    @BeforeEach
    fun resetTestData() {
        innerNode = Node()
        someOtherInnerNode = Node()
        root = Root(innerNode)
        crossReference = Node.CrossReference(innerNode)
    }

    @Test
    fun `setter should register cross-reference on new node`() {
        crossReference.node = someOtherInnerNode
        someOtherInnerNode.crossReferences().shouldContainExactly(crossReference)
    }

    @Test
    fun `setter should update the value`() {
        crossReference.node = someOtherInnerNode
        crossReference.node shouldBe someOtherInnerNode
    }

    @Test
    fun `setter should deregister cross-reference on old node`() {
        crossReference.node = someOtherInnerNode
        innerNode.crossReferences().shouldBeEmpty()
    }

    @Test
    fun `onMove should be called when the node is moved`() {
        var wasCalled = false
        crossReference = Node.CrossReference(innerNode) { _, _ -> wasCalled = true }
        innerNode.release()

        wasCalled.shouldBeTrue()
    }

    @Test
    fun `onMove should not called when the node was not moved`() {
        var wasCalled = false
        crossReference = Node.CrossReference(someOtherInnerNode) { _, _ -> wasCalled = true }
        someOtherInnerNode.release()

        wasCalled.shouldBeFalse()
    }
}
