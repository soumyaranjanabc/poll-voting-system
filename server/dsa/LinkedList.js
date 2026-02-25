/**
 * DOUBLY LINKED LIST
 * ──────────────────
 * Used for: Vote activity feed & navigable history
 *
 * Each node has data + pointer to NEXT and PREVIOUS node.
 * Unlike arrays, insertion/deletion at head/tail is O(1).
 *
 * Structure:
 *   null ← [prev|data|next] ↔ [prev|data|next] ↔ [prev|data|next] → null
 *           HEAD                                   TAIL
 *
 * Time Complexity:
 *   append()      → O(1)  — direct tail access
 *   prepend()     → O(1)  — direct head access
 *   delete()      → O(n)  — must find node first
 *   getRecent(n)  → O(n)  — traverse from tail backwards
 *   toArray()     → O(n)  — full traversal
 *
 * Space Complexity: O(n)
 *
 * Advantage over array:
 *   - O(1) insert at both ends (array prepend is O(n))
 *   - Can traverse both directions
 *   - No shifting needed on insert/delete
 */

class Node {
  constructor(data) {
    this.data = data;
    this.prev = null;
    this.next = null;
  }
}

class DoublyLinkedList {
  constructor(maxSize = 100) {
    this.head = null;
    this.tail = null;
    this.size = 0;
    this.maxSize = maxSize; // cap to prevent memory overflow
  }

  // ── Append to tail ────────────────────────────────────
  // O(1) — direct tail pointer access
  append(data) {
    const node = new Node(data);

    if (!this.head) {
      this.head = this.tail = node;
    } else {
      node.prev = this.tail;
      this.tail.next = node;
      this.tail = node;
    }

    this.size++;

    // Auto-evict oldest (head) if max size reached
    if (this.size > this.maxSize) {
      this.removeHead();
    }

    return this;
  }

  // ── Prepend to head ───────────────────────────────────
  // O(1)
  prepend(data) {
    const node = new Node(data);

    if (!this.head) {
      this.head = this.tail = node;
    } else {
      node.next = this.head;
      this.head.prev = node;
      this.head = node;
    }

    this.size++;
    return this;
  }

  // ── Remove head ───────────────────────────────────────
  // O(1)
  removeHead() {
    if (!this.head) return null;
    const data = this.head.data;

    if (this.head === this.tail) {
      this.head = this.tail = null;
    } else {
      this.head = this.head.next;
      this.head.prev = null;
    }

    this.size--;
    return data;
  }

  // ── Remove tail ───────────────────────────────────────
  // O(1)
  removeTail() {
    if (!this.tail) return null;
    const data = this.tail.data;

    if (this.head === this.tail) {
      this.head = this.tail = null;
    } else {
      this.tail = this.tail.prev;
      this.tail.next = null;
    }

    this.size--;
    return data;
  }

  // ── Get N most recent items (traverse from tail backwards) ─
  // O(n)
  getRecent(n) {
    const result = [];
    let current = this.tail;
    let count = 0;

    while (current && count < n) {
      result.unshift(current.data); // prepend to maintain chronological order
      current = current.prev;
      count++;
    }

    return result;
  }

  // ── Forward traversal → array ─────────────────────────
  // O(n)
  toArray() {
    const result = [];
    let current = this.head;
    while (current) {
      result.push(current.data);
      current = current.next;
    }
    return result;
  }

  // ── Backward traversal → array ────────────────────────
  // O(n)
  toArrayReverse() {
    const result = [];
    let current = this.tail;
    while (current) {
      result.push(current.data);
      current = current.prev;
    }
    return result;
  }

  // ── Search by poll_id ─────────────────────────────────
  // O(n)
  findByPollId(pollId) {
    let current = this.head;
    while (current) {
      if (current.data.poll_id === pollId) return current.data;
      current = current.next;
    }
    return null;
  }

  isEmpty() { return this.size === 0; }
}

// ── Singleton activity feed (in-memory) ───────────────
// In production this would be persisted to Redis/DB
const activityFeed = new DoublyLinkedList(50); // keep last 50 activities

const addActivity = (activity) => {
  activityFeed.append({
    ...activity,
    timestamp: new Date().toISOString(),
  });
};

const getRecentActivity = (n = 10) => activityFeed.getRecent(n);

module.exports = { DoublyLinkedList, addActivity, getRecentActivity };
