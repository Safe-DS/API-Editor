package com.larsreimann.api_editor.mutable_model

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
     * The container of this node in the tree.
     */
    private var container: TreeNodeContainer? = null

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
     * Sets parent and container references to the specified value.
     */
    private fun moveTo(newParent: TreeNode?, newContainer: TreeNodeContainer?) {
        this.parent = newParent
        this.container = newContainer
    }

    /**
     * Sets parent and container references to null.
     */
    private fun remove() {

        moveTo(null, null)
    }

    /**
     * A container for [TreeNode]s of the given type.
     */
    private sealed interface TreeNodeContainer {

        /**
         * Removed the tree node from the container.
         */
        fun removeTreeNode(node: TreeNode)
    }

    /**
     * Stores a list of references to [TreeNode]s and keeps references to them updated on mutation.
     *
     * @param nodes The initial nodes.
     */
    inner class TreeNodeList<E : TreeNode>(nodes: Collection<E> = emptyList()) : TreeNodeContainer, ArrayList<E>() {
        init {
            addAll(nodes)
        }

        override fun removeTreeNode(node: TreeNode) {
            remove(node)
        }

        override fun add(element: E): Boolean {
            element.parent = this@TreeNode
            return super.add(element)
        }

        override fun remove(element: E): Boolean {
            val wasRemoved = super.remove(element)
            if (wasRemoved) {
                element.parent = null
            }
            return wasRemoved
        }

        override fun addAll(elements: Collection<E>): Boolean {
            elements.forEach { it.parent = this@TreeNode }
            return super.addAll(elements)
        }

        override fun addAll(index: Int, elements: Collection<E>): Boolean {
            elements.forEach { it.parent = this@TreeNode }
            return super.addAll(index, elements)
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
            super.clear()
        }

        override operator fun set(index: Int, element: E): E {
            element.parent = this@TreeNode
            val replacedElement = super.set(index, element)
            replacedElement.parent = null
            return replacedElement
        }

        override fun add(index: Int, element: E) {
            element.parent = this@TreeNode
            super.add(index, element)
        }

        override fun removeAt(index: Int): E {
            val removedElement = super.removeAt(index)
            removedElement.parent = null
            return removedElement
        }
    }

    /**
     * Stores a reference to a [TreeNode] and keeps references to it updated on mutation.
     *
     * @param node The initial node.
     */
    inner class TreeNodeReference<T : TreeNode>(node: T?) : TreeNodeContainer {

        // TODO:
        //  General steps:
        //  * Remove up-references on old value (parent + container <- which must be this unless the value is null)
        //  * Remove down-reference on this container to old value
        //  * Remove down-references on old container of new value
        //  * Set up-references on new value (parent + container)
        //  * Set down-references on this container (to new value)

        var node: T? = node
            set(value) {
                // Up-references on old value
                field?.parent = null
                field?.container = null

                // Down-references on this container
                field = null

                // Down-references on old container of new value
                value?.container?.removeTreeNode(value)

                // Up-references on new value
                value?.parent = this@TreeNode
                value?.container = this@TreeNodeReference

                // Down-references on this container
                field = value
            }

        override fun removeTreeNode(node: TreeNode) {
            if (this.node == node) {
                this.node = null
            }
        }
    }
}
