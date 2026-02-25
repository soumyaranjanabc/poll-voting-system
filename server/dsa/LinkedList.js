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
    this.maxSize = maxSize;
  }

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

    if (this.size > this.maxSize) {
      this.removeHead();
    }

    return this;
  }

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

  getRecent(n) {
    const result = [];
    let current = this.tail;
    let count = 0;

    while (current && count < n) {
      result.unshift(current.data);
      current = current.prev;
      count++;
    }

    return result;
  }

  toArray() {
    const result = [];
    let current = this.head;
    while (current) {
      result.push(current.data);
      current = current.next;
    }
    return result;
  }

  toArrayReverse() {
    const result = [];
    let current = this.tail;
    while (current) {
      result.push(current.data);
      current = current.prev;
    }
    return result;
  }

  findByPollId(pollId) {
    let current = this.head;
    while (current) {
      if (current.data.poll_id === pollId) return current.data;
      current = current.next;
    }
    return null;
  }

  isEmpty() {
    return this.size === 0;
  }
}

const activityFeed = new DoublyLinkedList(50);

const addActivity = (activity) => {
  activityFeed.append({
    ...activity,
    timestamp: new Date().toISOString(),
  });
};

const getRecentActivity = (n = 10) => activityFeed.getRecent(n);

module.exports = {
  DoublyLinkedList,
  addActivity,
  getRecentActivity,
};