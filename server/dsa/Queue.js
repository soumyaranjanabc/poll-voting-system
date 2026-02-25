/**
 * QUEUE (using Object — O(1) enqueue & dequeue)
 * ──────────────────────────────────────────────
 * Used for: Processing expiring polls in order (FIFO)
 *
 * A Queue follows FIFO — First In, First Out.
 * Like a line at a counter — first person in = first served.
 *
 * We use an Object instead of Array to avoid O(n) shift() on dequeue.
 * Two pointers (front, back) track the valid range.
 *
 * Time Complexity:
 *   enqueue() → O(1)
 *   dequeue() → O(1)  ← key advantage over array (array shift = O(n))
 *   peek()    → O(1)
 *   size()    → O(1)
 *
 * Space Complexity: O(n)
 *
 * Why not use Array?
 *   array.push()    → O(1) ✅ (enqueue)
 *   array.shift()   → O(n) ❌ (dequeue — shifts ALL elements left)
 *   object[front++] → O(1) ✅ (dequeue — just move pointer)
 */

class Queue {
  constructor() {
    this.items = {};
    this.front = 0;
    this.back = 0;
  }

  // ── Add to back ───────────────────────────────────────
  // O(1)
  enqueue(item) {
    this.items[this.back] = item;
    this.back++;
    return this;
  }

  // ── Remove from front ─────────────────────────────────
  // O(1) — just increment front pointer, no shifting
  dequeue() {
    if (this.isEmpty()) return null;
    const item = this.items[this.front];
    delete this.items[this.front];
    this.front++;
    return item;
  }

  // ── Peek at front without removing ───────────────────
  // O(1)
  peek() {
    return this.items[this.front] || null;
  }

  isEmpty() { return this.front === this.back; }
  size()    { return this.back - this.front; }

  // ── Process all items with a callback ─────────────────
  // O(n)
  processAll(callback) {
    const processed = [];
    while (!this.isEmpty()) {
      const item = this.dequeue();
      const result = callback(item);
      processed.push({ item, result });
    }
    return processed;
  }

  // ── Convert to array (non-destructive) ────────────────
  // O(n)
  toArray() {
    const result = [];
    for (let i = this.front; i < this.back; i++) {
      if (this.items[i] !== undefined) result.push(this.items[i]);
    }
    return result;
  }
}

/**
 * POLL EXPIRY QUEUE
 * Polls approaching expiry are enqueued and processed in order.
 * This ensures no poll expires undetected.
 */
class PollExpiryQueue {
  constructor() {
    this.queue = new Queue();
    this.processed = new Set(); // track already-processed poll IDs
  }

  // Add poll to expiry queue
  enqueueExpiring(poll) {
    if (!this.processed.has(poll.id)) {
      this.queue.enqueue({
        pollId: poll.id,
        title: poll.title,
        expiresAt: new Date(poll.expires_at),
        queuedAt: new Date(),
      });
    }
  }

  // Process next expiring poll
  processNext() {
    const item = this.queue.dequeue();
    if (!item) return null;
    this.processed.add(item.pollId);
    return item;
  }

  // Check and enqueue polls expiring within next N minutes
  checkExpiring(polls, withinMinutes = 60) {
    const now = new Date();
    const cutoff = new Date(now.getTime() + withinMinutes * 60 * 1000);

    polls.forEach(poll => {
      if (poll.expires_at) {
        const expiry = new Date(poll.expires_at);
        if (expiry > now && expiry <= cutoff) {
          this.enqueueExpiring(poll);
        }
      }
    });

    return this.queue.size();
  }

  getQueueSize() { return this.queue.size(); }
  getQueueItems() { return this.queue.toArray(); }
}

module.exports = { Queue, PollExpiryQueue };
