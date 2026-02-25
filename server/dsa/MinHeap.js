/**
 * MIN-HEAP (Priority Queue)
 * ─────────────────────────
 * Used for: Ranking trending polls by activity score
 *
 * A Min-Heap is a complete binary tree where every parent node
 * has a value LESS THAN or equal to its children.
 *
 * Internal storage: array (index math replaces pointers)
 *   Parent of i  → Math.floor((i - 1) / 2)
 *   Left child   → 2 * i + 1
 *   Right child  → 2 * i + 2
 *
 * Time Complexity:
 *   insert()     → O(log n)  — bubbles up at most tree height
 *   extractMin() → O(log n)  — sinks down at most tree height
 *   peek()       → O(1)      — root is always minimum
 *   getTopN()    → O(n log n)
 *
 * Space Complexity: O(n)
 */

class MinHeap {
  constructor() {
    this.heap = [];
  }

  // ── Helper: index arithmetic ──────────────────────────
  _parentIdx(i) { return Math.floor((i - 1) / 2); }
  _leftIdx(i)   { return 2 * i + 1; }
  _rightIdx(i)  { return 2 * i + 2; }

  _swap(i, j) {
    [this.heap[i], this.heap[j]] = [this.heap[j], this.heap[i]];
  }

  // ── Insert: add to end, bubble up ─────────────────────
  // O(log n)
  insert(item) {
    this.heap.push(item);
    this._bubbleUp(this.heap.length - 1);
  }

  _bubbleUp(index) {
    while (index > 0) {
      const parent = this._parentIdx(index);
      if (this.heap[parent].score <= this.heap[index].score) break;
      this._swap(parent, index);
      index = parent;
    }
  }

  // ── Extract min: remove root, put last element at root, sink down ─
  // O(log n)
  extractMin() {
    if (this.heap.length === 0) return null;
    if (this.heap.length === 1) return this.heap.pop();

    const min = this.heap[0];
    this.heap[0] = this.heap.pop(); // move last to root
    this._sinkDown(0);
    return min;
  }

  _sinkDown(index) {
    const length = this.heap.length;

    while (true) {
      let smallest = index;
      const left  = this._leftIdx(index);
      const right = this._rightIdx(index);

      if (left < length && this.heap[left].score < this.heap[smallest].score)
        smallest = left;
      if (right < length && this.heap[right].score < this.heap[smallest].score)
        smallest = right;

      if (smallest === index) break; // already in correct position

      this._swap(smallest, index);
      index = smallest;
    }
  }

  // ── Peek at minimum without removing ─────────────────
  // O(1)
  peek() {
    return this.heap[0] || null;
  }

  size() { return this.heap.length; }
  isEmpty() { return this.heap.length === 0; }

  // ── Get top N trending polls (highest score = most trending) ─
  // O(n log n) — we invert score so highest activity = lowest score in heap
  getTopN(n) {
    // Clone heap, extract mins repeatedly
    const clone = new MinHeap();
    clone.heap = [...this.heap];
    const result = [];
    for (let i = 0; i < n && !clone.isEmpty(); i++) {
      result.push(clone.extractMin());
    }
    return result;
  }

  // ── Build heap from array ─────────────────────────────
  // O(n) — more efficient than inserting one by one O(n log n)
  buildFromArray(arr) {
    this.heap = [...arr];
    // Start from last non-leaf and sink down each node
    for (let i = Math.floor(this.heap.length / 2) - 1; i >= 0; i--) {
      this._sinkDown(i);
    }
  }

  // ── Utility: view heap as array ───────────────────────
  toArray() { return [...this.heap]; }
}

/**
 * TRENDING SCORE FORMULA:
 * score = total_votes / hours_since_creation
 * Higher score = more trending
 * We store as negative so MinHeap gives us highest scores first
 */
const calculateTrendingScore = (poll) => {
  const hoursSinceCreation =
    (Date.now() - new Date(poll.created_at).getTime()) / (1000 * 60 * 60) || 1;
  const votesPerHour = poll.total_votes / hoursSinceCreation;
  // Negate so highest activity = smallest value in MinHeap
  return -votesPerHour;
};

module.exports = { MinHeap, calculateTrendingScore };
