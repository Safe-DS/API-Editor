package com.larsreimann.api_editor.mutable_model

import kotlin.reflect.KProperty

/**
 * A node in a tree. It has references to its parent and its children.
 */
open class TreeNode {

    /**
     * Parent and container of this node in the tree.
     */
    private var location: Location = Location(null, null)

    /**
     * The parent of this node in the tree.
     */
    val parent: TreeNode?
        get() = location.parent

    /**
     * The container of this node in the tree.
     */
    val container: Container<*>?
        get() = location.container

    /**
     * Cross-references to this node. They get notified whenever this node is moved.
     */
    private val crossReferences = mutableListOf<CrossReference<*>>()

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
     * Cross-references to this node. They get notified whenever this node is moved.
     */
    fun crossReferences() = crossReferences.toList().asSequence()

    /**
     * Releases the subtree that has this node as root.
     */
    fun release() {
        this.container?.releaseNode(this)
    }

    /**
     * Sets parent and container of this node in the tree.
     */
    private fun move(newParent: TreeNode?, newContainer: Container<*>?) {
        val oldLocation = this.location
        val newLocation = Location(newParent, newContainer)
        this.location = newLocation

        crossReferences.forEach { it.onMove(oldLocation, newLocation) }
    }

    /**
     * A container for [TreeNode]s of the given type.
     */
    sealed class Container<T : TreeNode> {

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
            node?.move(newParent = null, newContainer = null)
        }

        /**
         * Sets parent and container properties of the node to this container. This method can be called without causing
         * cyclic updates.
         */
        protected fun TreeNode?.pointUplinksToThisContainer(node: TreeNode?) {
            node?.move(newParent = this@pointUplinksToThisContainer, newContainer = this@Container)
        }
    }

    /**
     * Stores a reference to a [TreeNode] and keeps uplinks (parent/container) and downlinks (container to node) updated
     * on mutation.
     *
     * **Samples:**
     *
     * _Normal assignment:_
     * ```kt
     * object Root: TreeNode() {
     *     private val child = ContainmentReference(TreeNode())
     *
     *     fun get(): TreeNode? {
     *         return child.node
     *     }
     *
     *     fun set(newNode: TreeNode?) {
     *         child.node = newNode
     *     }
     * }
     * ```
     *
     * _Mutable delegate:_
     * ```kt
     * object Root: TreeNode() {
     *     private var child by ContainmentReference(TreeNode())
     *
     *     fun get(): TreeNode? {
     *         return child
     *     }
     *
     *     fun set(newNode: TreeNode?) {
     *         child = newNode
     *     }
     * }
     * ```
     *
     * _Immutable delegate:_
     * ```kt
     * object Root: TreeNode() {
     *     private val child by ContainmentReference(TreeNode())
     *
     *     fun get(): TreeNode? {
     *         return child
     *     }
     *
     *     fun set(newNode: TreeNode?) {
     *         // Not possible
     *     }
     * }
     * ```
     *
     * @param node The initial value.
     */
    inner class ContainmentReference<T : TreeNode>(node: T?) : Container<T>() {
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

        operator fun getValue(node: T, property: KProperty<*>): T? {
            return this.node
        }

        operator fun setValue(oldNode: T, property: KProperty<*>, newNode: T?) {
            this.node = newNode
        }
    }

    /**
     * Stores a list of references to [TreeNode]s and keeps uplinks (parent/container) and downlinks (container to node)
     * updated on mutation.
     *
     * @param nodes The initial nodes.
     */
    inner class ContainmentList<T : TreeNode> private constructor(
        nodes: Collection<T>,
        private val delegate: MutableList<T>
    ) : Container<T>(), MutableList<T> by delegate {

        constructor(nodes: Collection<T> = emptyList()) : this(nodes, mutableListOf())

        init {
            addAll(nodes)
        }

        override fun releaseNode(node: TreeNode) {
            this.remove(node)
        }

        override fun add(element: T): Boolean {
            element.release()
            pointUplinksToThisContainer(element)
            return delegate.add(element)
        }

        override fun add(index: Int, element: T) {
            element.release()
            pointUplinksToThisContainer(element)
            delegate.add(index, element)
        }

        override fun addAll(elements: Collection<T>): Boolean {
            elements.forEach {
                it.release()
                pointUplinksToThisContainer(it)
            }
            return delegate.addAll(elements)
        }

        override fun addAll(index: Int, elements: Collection<T>): Boolean {
            elements.forEach {
                it.release()
                pointUplinksToThisContainer(it)
            }
            return delegate.addAll(index, elements)
        }

        override fun remove(element: T): Boolean {
            val wasRemoved = delegate.remove(element)
            if (wasRemoved) {
                nullifyUplinks(element)
            }
            return wasRemoved
        }

        override fun removeAt(index: Int): T {
            val removedElement = delegate.removeAt(index)
            nullifyUplinks(removedElement)
            return removedElement
        }

        override fun removeAll(elements: Collection<T>): Boolean {
            return elements.fold(false) { accumulator, element ->
                accumulator || remove(element)
            }
        }

        override fun retainAll(elements: Collection<T>): Boolean {
            val toRemove = subtract(elements.toSet())
            return removeAll(toRemove)
        }

        override fun clear() {
            forEach { nullifyUplinks(it) }
            delegate.clear()
        }

        override fun set(index: Int, element: T): T {
            val replacedElement = delegate.set(index, element)
            nullifyUplinks(replacedElement)

            element.release()
            pointUplinksToThisContainer(element)

            return replacedElement
        }
    }

    /**
     * References a [TreeNode] without containing it. Gets notified whenever the [TreeNode] is moved.
     */
    class CrossReference<T : TreeNode>(
        node: T?,
        val handleMove: CrossReference<T>.(from: Location, to: Location) -> Unit = { _, _ -> }
    ) {
        var node: T? = null
            set(value) {
                if (field == value) {
                    return
                }

                field?.crossReferences?.remove(this)
                field = value
                value?.crossReferences?.add(this)
            }

        init {
            this.node = node
        }

        internal fun onMove(from: Location, to: Location) {
            handleMove(from, to)
        }

        operator fun getValue(node: T, property: KProperty<*>): T? {
            return this.node
        }

        operator fun setValue(oldNode: T, property: KProperty<*>, newNode: T?) {
            this.node = newNode
        }
    }

    data class Location(val parent: TreeNode?, val container: Container<*>?)
}
