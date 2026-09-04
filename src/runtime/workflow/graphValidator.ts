import { WorkflowNode, WorkflowEdge } from '../../types/workflow';

export interface GraphValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  executionOrder: string[]; // Node keys in topological order
}

/**
 * Validates a workflow DAG:
 * 1. Must have at least one trigger node.
 * 2. Every edge must reference valid source and target node keys.
 * 3. Detects circular dependencies (cycles) using DFS cycle detection.
 * 4. Computes valid topological execution order.
 */
export const validateWorkflowGraph = (
  nodes: WorkflowNode[],
  edges: WorkflowEdge[]
): GraphValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!nodes || nodes.length === 0) {
    return {
      isValid: false,
      errors: ['Workflow must contain at least one node.'],
      warnings: [],
      executionOrder: [],
    };
  }

  // Node keys lookup & duplicate check
  const nodeKeySet = new Set<string>();
  const triggerNodes: WorkflowNode[] = [];

  for (const node of nodes) {
    if (!node.node_key || node.node_key.trim() === '') {
      errors.push(`Node "${node.name || 'Unnamed'}" has missing or empty node_key.`);
    } else if (nodeKeySet.has(node.node_key)) {
      errors.push(`Duplicate node key detected: "${node.node_key}". Node keys must be unique.`);
    } else {
      nodeKeySet.add(node.node_key);
    }

    if (node.node_type === 'TRIGGER') {
      triggerNodes.push(node);
    }
  }

  if (triggerNodes.length === 0) {
    errors.push('Workflow must contain at least one TRIGGER node to initiate execution.');
  }

  // Edge validation
  for (const edge of edges) {
    if (!nodeKeySet.has(edge.source_node_key)) {
      errors.push(`Edge connects from nonexistent source node: "${edge.source_node_key}".`);
    }
    if (!nodeKeySet.has(edge.target_node_key)) {
      errors.push(`Edge connects to nonexistent target node: "${edge.target_node_key}".`);
    }
    if (edge.source_node_key === edge.target_node_key) {
      errors.push(`Self-referencing loop detected on node: "${edge.source_node_key}".`);
    }
  }

  if (errors.length > 0) {
    return {
      isValid: false,
      errors,
      warnings,
      executionOrder: [],
    };
  }

  // Build Adjacency List and In-Degree Map
  const adj = new Map<string, string[]>();
  const inDegree = new Map<string, number>();

  for (const node of nodes) {
    adj.set(node.node_key, []);
    inDegree.set(node.node_key, 0);
  }

  for (const edge of edges) {
    adj.get(edge.source_node_key)!.push(edge.target_node_key);
    inDegree.set(edge.target_node_key, (inDegree.get(edge.target_node_key) || 0) + 1);
  }

  // Detect Cycles using Kahn's Algorithm (Topological Sort)
  const queue: string[] = [];
  for (const [nodeKey, deg] of inDegree.entries()) {
    if (deg === 0) {
      queue.push(nodeKey);
    }
  }

  const executionOrder: string[] = [];

  while (queue.length > 0) {
    const curr = queue.shift()!;
    executionOrder.push(curr);

    const neighbors = adj.get(curr) || [];
    for (const neighbor of neighbors) {
      const newDeg = inDegree.get(neighbor)! - 1;
      inDegree.set(neighbor, newDeg);
      if (newDeg === 0) {
        queue.push(neighbor);
      }
    }
  }

  if (executionOrder.length !== nodes.length) {
    // Cycle detected
    const unvisited = nodes.filter((n) => !executionOrder.includes(n.node_key)).map((n) => n.node_key);
    errors.push(`Circular dependency cycle detected among nodes: ${unvisited.join(' ↔ ')}. Workflows must be a Directed Acyclic Graph (DAG).`);
    return {
      isValid: false,
      errors,
      warnings,
      executionOrder: [],
    };
  }

  // Check for orphan nodes that have in-degree 0 but are not TRIGGER nodes
  for (const node of nodes) {
    if (node.node_type !== 'TRIGGER') {
      const incoming = edges.filter((e) => e.target_node_key === node.node_key);
      if (incoming.length === 0) {
        warnings.push(`Node "${node.name}" (${node.node_key}) has no incoming connections and will execute concurrently with triggers.`);
      }
    }
  }

  return {
    isValid: true,
    errors: [],
    warnings,
    executionOrder,
  };
};
