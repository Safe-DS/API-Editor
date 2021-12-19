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
    private var container: TreeNodeContainer<*>? = null

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
     * Releases the subtree that has this node as root.
     */
    fun release() {
        this.container?.releaseNode(this)
    }

    /**
     * A container for [TreeNode]s of the given type.
     */
    sealed class TreeNodeContainer<T : TreeNode> {

        /**
         * Releases the subtree that has this node as root. If this container does not contain the node nothing should
         * happen. Otherwise, the following links need to be removed:
         *   - From the container to the node
         *   - From the node to its parent
         *   - From the node to its container
         */
        internal abstract fun releaseNode(node: TreeNode)

        /**
         * Sets parent and container properties of the node to `null`. This method can be called without causing cyclic
         * updates.
         */
        protected fun nullifyUplinks(node: TreeNode?) {
            node?.parent = null
            node?.container = null
        }

        /**
         * Sets parent and container properties of the node to `null`. This method can be called without causing cyclic
         * updates.
         */
        protected fun TreeNode?.pointUplinksToThisContainer(node: TreeNode?) {
            node?.parent = this
            node?.container = this@TreeNodeContainer
        }
    }

    /**
     * Stores a reference to a [TreeNode] and keeps references to it updated on mutation.
     *
     * @param node The initial node.
     */
    inner class ContainmentReference<T : TreeNode>(node: T?) : TreeNodeContainer<T>() {
        var node: T? = null
            set(value) {

                // Prevents infinite recursion when releasing the new value
                if (field == value) {
                    return
                }

                // Release old value
                nullifyUplinks(field)
                field = null

                // Release new value
                value?.release()

                // Store new value in this container
                pointUplinksToThisContainer(value)
                field = value
            }

        init {
            this.node = node
        }

        override fun releaseNode(node: TreeNode) {
            if (this.node == node) {
                this.node = null
            }
        }
    }

    /**
     * Stores a list of references to [TreeNode]s and keeps references to them updated on mutation.
     *
     * @param nodes The initial nodes.
     */
    inner class ContainmentList<T : TreeNode> private constructor(
        nodes: Collection<T>,
        private val delegate: MutableList<T>
    ) : TreeNodeContainer<T>(), MutableList<T> by delegate {

        constructor(nodes: Collection<T> = emptyList()) : this(nodes, mutableListOf())

        init {
            addAll(nodes)
        }

        override fun releaseNode(node: TreeNode) {
            this.remove(node)
        }

        override fun add(element: T): Boolean {
            element.parent = this@TreeNode
            return delegate.add(element)
        }

        override fun remove(element: T): Boolean {
            val wasRemoved = delegate.remove(element)
            if (wasRemoved) {
                element.parent = null
            }
            return wasRemoved
        }

        override fun addAll(elements: Collection<T>): Boolean {
            elements.forEach { it.parent = this@TreeNode }
            return delegate.addAll(elements)
        }

        override fun addAll(index: Int, elements: Collection<T>): Boolean {
            elements.forEach { it.parent = this@TreeNode }
            return delegate.addAll(index, elements)
        }

        override fun removeAll(elements: Collection<T>): Boolean {
            var result = false
            for (it in elements) {
                val wasRemoved = remove(it)
                if (wasRemoved) {
                    result = true
                }
            }
            return result
        }

        override fun retainAll(elements: Collection<T>): Boolean {
            val toRemove = subtract(elements.toSet())
            return removeAll(toRemove)
        }

        override fun clear() {
            forEach { it.parent = null }
            delegate.clear()
        }

        override operator fun set(index: Int, element: T): T {
            element.parent = this@TreeNode
            val replacedElement = delegate.set(index, element)
            replacedElement.parent = null
            return replacedElement
        }

        override fun add(index: Int, element: T) {
            element.parent = this@TreeNode
            delegate.add(index, element)
        }

        override fun removeAt(index: Int): T {
            val removedElement = delegate.removeAt(index)
            removedElement.parent = null
            return removedElement
        }
    }
}
