export interface Legend {
  nodes: Node[]
  title: string
}

export interface Node {
  icon: string
  title: string
  description?: string

  symbols: NodeSymbol[]
  type: string
}

export interface NodeSymbol {
  icon: string
  title: string
  description?: string

  scaleMaxDenom?: number
  scaleMinDenom?: number

  extra_description?: string
}
