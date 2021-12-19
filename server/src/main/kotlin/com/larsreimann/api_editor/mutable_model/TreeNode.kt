package com.larsreimann.api_editor.mutable_model

/**
 * A node in a tree. It has references to its parent and its children.
 */
open class TreeNode {

    // To prevent cyclic updates between nodes and containers only the following interactions are allowed:
    //  - Everything can access their own functions and properties
    //  - Node can access functions and properties on Container
    //  - Container can access parent and container properties on Node
    //  - Container can access functions defined in TreeNodeContainer on other Containers

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
         * - From the container to the node
         * - From the node to its parent
         * - From the node to its container
         */
        internal abstract fun releaseNode(node: TreeNode)
    }

    /**
     * Stores a reference to a [TreeNode] and keeps references to it updated on mutation.
     *
     * @param node The initial node.
     */
    inner class ContainmentReference<T : TreeNode>(node: T?) : TreeNodeContainer<T>() {

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
                value?.container?.releaseNode(value)

                // Up-references on new value
                value?.parent = this@TreeNode
                value?.container = this@ContainmentReference

                // Down-references on this container
                field = value
            }

        override fun releaseNode(node: TreeNode) {
            this.node = null
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
            TODO("Not yet implemented")
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
