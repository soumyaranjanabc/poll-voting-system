class Queue {
  constructor() {
    this.items = {};
    this.front = 0;
    this.back = 0;
  }

  enqueue(item) {
    this.items[this.back] = item;
    this.back++;
    return this;
  }

  dequeue() {
    if (this.isEmpty()) return null;
    const item = this.items[this.front];
    delete this.items[this.front];
    this.front++;
    return item;
  }

  peek() {
    return this.items[this.front] || null;
  }

  isEmpty() {
    return this.front === this.back;
  }

  size() {
    return this.back - this.front;
  }

  processAll(callback) {
    const processed = [];
    while (!this.isEmpty()) {
      const item = this.dequeue();
      const result = callback(item);
      processed.push({ item, result });
    }
    return processed;
  }

  toArray() {
    const result = [];
    for (let i = this.front; i < this.back; i++) {
      if (this.items[i] !== undefined) result.push(this.items[i]);
    }
    return result;
  }
}

class PollExpiryQueue {
  constructor() {
    this.queue = new Queue();
    this.processed = new Set();
  }

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

  processNext() {
    const item = this.queue.dequeue();
    if (!item) return null;
    this.processed.add(item.pollId);
    return item;
  }

  checkExpiring(polls, withinMinutes = 60) {
    const now = new Date();
    const cutoff = new Date(now.getTime() + withinMinutes * 60 * 1000);

    polls.forEach((poll) => {
      if (poll.expires_at) {
        const expiry = new Date(poll.expires_at);
        if (expiry > now && expiry <= cutoff) {
          this.enqueueExpiring(poll);
        }
      }
    });

    return this.queue.size();
  }

  getQueueSize() {
    return this.queue.size();
  }

  getQueueItems() {
    return this.queue.toArray();
  }
}

module.exports = { Queue, PollExpiryQueue };