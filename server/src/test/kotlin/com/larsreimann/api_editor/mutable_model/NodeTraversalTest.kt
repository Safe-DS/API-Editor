package com.larsreimann.api_editor.mutable_model

import io.kotest.matchers.collections.shouldContainExactly
import io.kotest.matchers.shouldBe
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test

class NodeTraversalTest {

    private class Root(children: List<Node>) : Node() {
        val children = ContainmentList(children)

        override fun children(): Sequence<Node> {
            return children.asSequence()
        }
    }

    private class InnerNode(child: Node) : Node() {
        val child by ContainmentReference(child)

        override fun children() = sequence {
            child?.let { yield(it) }
        }
    }

    private lateinit var leaf1: Node
    private lateinit var leaf2: Node
    private lateinit var leaf3: Node
    private lateinit var inner: InnerNode
    private lateinit var root: Root

    @BeforeEach
    fun resetTestData() {
        leaf1 = Node()
        leaf2 = Node()
        leaf3 = Node()
        inner = InnerNode(leaf1)
        root = Root(listOf(inner, leaf2, leaf3))
    }

    @Test
    fun `root() should return the node itself for the root`() {
        root.root() shouldBe root
    }

    @Test
    fun `root() should return the root for an inner node`() {
        leaf1.root() shouldBe root
    }

    @Test
    fun `ancestor() should return all nodes along the path to the root`() {
        leaf1.ancestors().toList().shouldContainExactly(inner, root)
    }

    @Test
    fun `ancestorOrSelf() should return the node and all nodes along the path to the root`() {
        leaf1.ancestorsOrSelf().toList().shouldContainExactly(leaf1, inner, root)
    }

    @Test
    fun `siblings() should return the siblings of the node`() {
        inner.siblings().toList().shouldContainExactly(leaf2, leaf3)
    }

    @Test
    fun `siblingsOrSelf() should return all children of the parent`() {
        inner.siblingsOrSelf().toList().shouldContainExactly(inner, leaf2, leaf3)
    }

    @Test
    fun `descendant(PREORDER) should return all nodes below of the node in preorder`() {
        root.descendants(Traversal.PREORDER).toList().shouldContainExactly(inner, leaf1, leaf2, leaf3)
    }

    @Test
    fun `descendant(POSTORDER) should return all nodes below of the node in postorder`() {
        root.descendants(Traversal.POSTORDER).toList().shouldContainExactly(leaf1, inner, leaf2, leaf3)
    }

    @Test
    fun `descendant() should prune nodes if a filter is passed`() {
        root.descendants { it is InnerNode }.toList().shouldContainExactly(leaf2, leaf3)
    }

    @Test
    fun `descendantOrSelf(PREORDER) should return the node and all nodes below it in preorder`() {
        root.descendantsOrSelf(Traversal.PREORDER).toList().shouldContainExactly(root, inner, leaf1, leaf2, leaf3)
    }

    @Test
    fun `descendantOrSelf(POSTORDER) should return the node and all nodes below it in postorder`() {
        root.descendantsOrSelf(Traversal.POSTORDER).toList().shouldContainExactly(leaf1, inner, leaf2, leaf3, root)
    }

    @Test
    fun `descendantOrSelf() should prune nodes if a filter is passed`() {
        root.descendantsOrSelf { it is InnerNode }.toList().shouldContainExactly(root, leaf2, leaf3)
    }

    @Test
    fun `closest() should return the node itself if has the correct type`() {
        inner.closest<InnerNode>() shouldBe inner
    }

    @Test
    fun `closest() should return the first node with the correct type along the path to the root`() {
        leaf1.closest<InnerNode>() shouldBe inner
    }
}
