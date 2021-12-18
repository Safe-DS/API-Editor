package com.larsreimann.api_editor.mutable_model

import kotlin.properties.Delegates

/**
 * A node in a tree. It has references to its parent and its children.
 */
open class TreeNode {

    /**
     * The parent of this node in the tree.
     */
    var parent: TreeNode? = null
        private set

    /**
     * Whether this node is the root of the tree.
     */
    fun isRoot(): Boolean {
        return parent == null
    }

    /**
     * The child nodes of this node.
     */
    open fun children() = emptySequence<TreeNode>()

    /**
     * Stores a list of references to [TreeNode]s and updates their parent reference on mutation.
     */
    inner class TreeNodeList<E : TreeNode> : ArrayList<E>() {

        override fun add(element: E): Boolean {
            element.parent = this@TreeNode
            return add(element)
        }

        override fun remove(element: E): Boolean {
            val wasRemoved = remove(element)
            if (wasRemoved) {
                element.parent = null
            }
            return wasRemoved
        }

        override fun addAll(elements: Collection<E>): Boolean {
            elements.forEach { it.parent = this@TreeNode }
            return addAll(elements)
        }

        override fun addAll(index: Int, elements: Collection<E>): Boolean {
            elements.forEach { it.parent = this@TreeNode }
            return addAll(index, elements)
        }

        override fun removeAll(elements: Collection<E>): Boolean {
            var result = false
            for (it in elements) {
                val wasRemoved = remove(it)
                if (wasRemoved) {
                    result = true
                }
            }
            return result
        }

        override fun retainAll(elements: Collection<E>): Boolean {
            val toRemove = subtract(elements.toSet())
            return removeAll(toRemove)
        }

        override fun clear() {
            forEach { it.parent = null }
            clear()
        }

        override operator fun set(index: Int, element: E): E {
            element.parent = this@TreeNode
            val replacedElement = set(index, element)
            replacedElement.parent = null
            return replacedElement
        }

        override fun add(index: Int, element: E) {
            element.parent = this@TreeNode
            add(index, element)
        }

        override fun removeAt(index: Int): E {
            val removedElement = removeAt(index)
            removedElement.parent = null
            return removedElement
        }
    }

    /**
     * Stores a reference to another [TreeNode] and updates its parent reference on assignment.
     */
    protected fun <T : TreeNode> reference() =
        Delegates.observable<T?>(null) { _, oldValue, newValue ->
            oldValue?.parent = null
            newValue?.parent = this
        }
}
