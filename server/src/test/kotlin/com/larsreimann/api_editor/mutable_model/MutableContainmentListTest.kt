package com.larsreimann.api_editor.mutable_model

import io.kotest.matchers.collections.shouldBeEmpty
import io.kotest.matchers.collections.shouldHaveSize
import io.kotest.matchers.nulls.shouldBeNull
import io.kotest.matchers.shouldBe
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test

class MutableContainmentListTest {

    private class Root(children: List<Node>, someMoreChildren: List<Node>) : Node() {
        val children = MutableContainmentList(children)
        val someMoreChildren = MutableContainmentList(someMoreChildren)
    }

    private lateinit var innerNode: Node
    private lateinit var someOtherInnerNode: Node
    private lateinit var root: Root

    @BeforeEach
    fun resetTestData() {
        innerNode = Node()
        someOtherInnerNode = Node()
        root = Root(listOf(innerNode), listOf(someOtherInnerNode))
    }

    @Test
    fun `constructor should correctly link initial values`() {
        innerNode.parent shouldBe root
        innerNode.container shouldBe root.children
        root.children.shouldHaveSize(1)
        root.children[0] shouldBe innerNode
    }

    @Test
    fun `releaseNode should update links if a node is passed that is referenced`() {
        root.children.releaseNode(innerNode)

        innerNode.parent.shouldBeNull()
        innerNode.container.shouldBeNull()
        root.children.shouldBeEmpty()
    }

    @Test
    fun `releaseNode should do nothing if a node is passed that is not referenced`() {
        root.children.releaseNode(someOtherInnerNode)

        innerNode.parent shouldBe root
        innerNode.container shouldBe root.children
        root.children.shouldHaveSize(1)
        root.children[0] shouldBe innerNode

        someOtherInnerNode.parent shouldBe root
        someOtherInnerNode.container shouldBe root.someMoreChildren
        root.someMoreChildren.shouldHaveSize(1)
        root.someMoreChildren[0] shouldBe someOtherInnerNode
    }

    @Test
    fun `add(T) should update links if a new node is passed`() {
        root.children.add(someOtherInnerNode)

        someOtherInnerNode.parent shouldBe root
        someOtherInnerNode.container shouldBe root.children
        root.children.shouldHaveSize(2)
        root.children[1] shouldBe someOtherInnerNode
        root.someMoreChildren.shouldBeEmpty()
    }

    @Test
    fun `add(T) should update links if an existing node is passed`() {
        root.children.add(innerNode)

        innerNode.parent shouldBe root
        innerNode.container shouldBe root.children
        root.children.shouldHaveSize(1)
        root.children[0] shouldBe innerNode
    }

    @Test
    fun `add(Int, T) should update links if a new node is passed`() {
        root.children.add(0, someOtherInnerNode)

        someOtherInnerNode.parent shouldBe root
        someOtherInnerNode.container shouldBe root.children
        root.children.shouldHaveSize(2)
        root.children[0] shouldBe someOtherInnerNode
        root.someMoreChildren.shouldBeEmpty()
    }

    @Test
    fun `add(Int, T) should update links if an existing node is passed`() {
        root.children.add(0, innerNode)

        innerNode.parent shouldBe root
        innerNode.container shouldBe root.children
        root.children.shouldHaveSize(1)
        root.children[0] shouldBe innerNode
    }

    @Test
    fun `addAll(Collection) should update links if new nodes are passed`() {
        root.children.addAll(listOf(someOtherInnerNode))

        someOtherInnerNode.parent shouldBe root
        someOtherInnerNode.container shouldBe root.children
        root.children.shouldHaveSize(2)
        root.children[1] shouldBe someOtherInnerNode
        root.someMoreChildren.shouldBeEmpty()
    }

    @Test
    fun `addAll(Collection) should update links if existing nodes are passed`() {
        root.children.addAll(listOf(innerNode))

        innerNode.parent shouldBe root
        innerNode.container shouldBe root.children
        root.children.shouldHaveSize(1)
        root.children[0] shouldBe innerNode
    }

    @Test
    fun `addAll(Int, Collection) should update links if new nodes are passed`() {
        root.children.addAll(0, listOf(someOtherInnerNode))

        someOtherInnerNode.parent shouldBe root
        someOtherInnerNode.container shouldBe root.children
        root.children.shouldHaveSize(2)
        root.children[0] shouldBe someOtherInnerNode
        root.someMoreChildren.shouldBeEmpty()
    }

    @Test
    fun `addAll(Int, Collection) should update links if existing nodes are passed`() {
        root.children.addAll(0, listOf(innerNode))

        innerNode.parent shouldBe root
        innerNode.container shouldBe root.children
        root.children.shouldHaveSize(1)
        root.children[0] shouldBe innerNode
    }

    @Test
    fun `remove(T) should update links if a node is removed that is referenced`() {
        root.children.remove(innerNode)

        innerNode.parent.shouldBeNull()
        innerNode.container.shouldBeNull()
        root.children.shouldBeEmpty()
    }

    @Test
    fun `remove(T) should do nothing if a node is removed that is not referenced`() {
        root.children.remove(someOtherInnerNode)

        innerNode.parent shouldBe root
        innerNode.container shouldBe root.children
        root.children.shouldHaveSize(1)
        root.children[0] shouldBe innerNode

        someOtherInnerNode.parent shouldBe root
        someOtherInnerNode.container shouldBe root.someMoreChildren
        root.someMoreChildren.shouldHaveSize(1)
        root.someMoreChildren[0] shouldBe someOtherInnerNode
    }

    @Test
    fun `removeAt(Int) should update links if a node exists at the index`() {
        root.children.removeAt(0)

        innerNode.parent.shouldBeNull()
        innerNode.container.shouldBeNull()
        root.children.shouldBeEmpty()
    }

    @Test
    fun `removeAll(Collection) should update links if nodes are removed that are referenced`() {
        root.children.removeAll(listOf(innerNode))

        innerNode.parent.shouldBeNull()
        innerNode.container.shouldBeNull()
        root.children.shouldBeEmpty()
    }

    @Test
    fun `removeAll(Collection) should do nothing if nodes are removed that are not referenced`() {
        root.children.removeAll(listOf(someOtherInnerNode))

        innerNode.parent shouldBe root
        innerNode.container shouldBe root.children
        root.children.shouldHaveSize(1)
        root.children[0] shouldBe innerNode

        someOtherInnerNode.parent shouldBe root
        someOtherInnerNode.container shouldBe root.someMoreChildren
        root.someMoreChildren.shouldHaveSize(1)
        root.someMoreChildren[0] shouldBe someOtherInnerNode
    }

    @Test
    fun `retainAll(Collection) should update links for nodes that are not retained`() {
        root.children.retainAll(listOf())

        innerNode.parent.shouldBeNull()
        innerNode.container.shouldBeNull()
        root.children.shouldBeEmpty()
    }

    @Test
    fun `retainAll(Collection) should not change the passed nodes`() {
        root.children.retainAll(listOf(someOtherInnerNode))

        someOtherInnerNode.parent shouldBe root
        someOtherInnerNode.container shouldBe root.someMoreChildren
        root.someMoreChildren.shouldHaveSize(1)
        root.someMoreChildren[0] shouldBe someOtherInnerNode
    }

    @Test
    fun `retainAll(Collection) should do nothing for nodes that are retained`() {
        root.children.retainAll(listOf(innerNode))

        innerNode.parent shouldBe root
        innerNode.container shouldBe root.children
        root.children.shouldHaveSize(1)
        root.children[0] shouldBe innerNode
    }

    @Test
    fun `clear() should update links for all nodes`() {
        root.children.clear()

        innerNode.parent.shouldBeNull()
        innerNode.container.shouldBeNull()
        root.children.shouldBeEmpty()
    }

    @Test
    fun `set(Int, T) should update links if a new node is passed`() {
        root.children[0] = someOtherInnerNode

        innerNode.parent.shouldBeNull()
        innerNode.container.shouldBeNull()

        someOtherInnerNode.parent shouldBe root
        someOtherInnerNode.container shouldBe root.children

        root.children.shouldHaveSize(1)
        root.children[0] shouldBe someOtherInnerNode
    }

    @Test
    fun `set(Int, T) should update links if an existing node is passed`() {
        root.children[0] = innerNode

        innerNode.parent shouldBe root
        innerNode.container shouldBe root.children
        root.children.shouldHaveSize(1)
        root.children[0] shouldBe innerNode
    }
}
