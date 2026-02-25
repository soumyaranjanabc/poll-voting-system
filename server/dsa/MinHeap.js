class MinHeap {
  constructor() {
    this.heap = [];
  }

  _parentIdx(i) {
    return Math.floor((i - 1) / 2);
  }

  _leftIdx(i) {
    return 2 * i + 1;
  }

  _rightIdx(i) {
    return 2 * i + 2;
  }

  _swap(i, j) {
    [this.heap[i], this.heap[j]] = [this.heap[j], this.heap[i]];
  }

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

  extractMin() {
    if (this.heap.length === 0) return null;
    if (this.heap.length === 1) return this.heap.pop();

    const min = this.heap[0];
    this.heap[0] = this.heap.pop();
    this._sinkDown(0);
    return min;
  }

  _sinkDown(index) {
    const length = this.heap.length;

    while (true) {
      let smallest = index;
      const left = this._leftIdx(index);
      const right = this._rightIdx(index);

      if (left < length && this.heap[left].score < this.heap[smallest].score)
        smallest = left;
      if (right < length && this.heap[right].score < this.heap[smallest].score)
        smallest = right;

      if (smallest === index) break;

      this._swap(smallest, index);
      index = smallest;
    }
  }

  peek() {
    return this.heap[0] || null;
  }

  size() {
    return this.heap.length;
  }

  isEmpty() {
    return this.heap.length === 0;
  }

  getTopN(n) {
    const clone = new MinHeap();
    clone.heap = [...this.heap];
    const result = [];
    for (let i = 0; i < n && !clone.isEmpty(); i++) {
      result.push(clone.extractMin());
    }
    return result;
  }

  buildFromArray(arr) {
    this.heap = [...arr];
    for (let i = Math.floor(this.heap.length / 2) - 1; i >= 0; i--) {
      this._sinkDown(i);
    }
  }

  toArray() {
    return [...this.heap];
  }
}

const calculateTrendingScore = (poll) => {
  const hoursSinceCreation =
    (Date.now() - new Date(poll.created_at).getTime()) / (1000 * 60 * 60) || 1;
  const votesPerHour = poll.total_votes / hoursSinceCreation;
  return -votesPerHour;
};

module.exports = { MinHeap, calculateTrendingScore };