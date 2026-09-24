export type FileNode = {
  type: "file"
} & CommonNodeProps

export type FolderNode = {
  type: "folder"
  children: TreeNode[]
} & CommonNodeProps

type CommonNodeProps = {
  name: string
  path: string
  selected?: boolean
}

export type TreeNode = FileNode | FolderNode

export class Tree {
  constructor(public root: FolderNode) {}

  select(path: string): Tree {
    const newRoot = this.map(this.root, (node) => ({
      ...node,
      selected: node.path === path,
    }))

    return new Tree(newRoot)
  }

  private map<T extends TreeNode>(node: T, fn: <N extends TreeNode>(node: N) => N): T {
    const updatedNode = fn(node)

    if (updatedNode.type === "folder") {
      return {
        ...updatedNode,
        children: updatedNode.children.map((c) => this.map(c, fn)),
      }
    }

    return updatedNode
  }
}
