/**
 * QUICKSORT
 * ─────────
 * Used for: Sorting poll results by vote count, percentage, or name
 *
 * QuickSort picks a PIVOT, partitions array into:
 *   LEFT  → elements smaller than pivot
 *   MIDDLE → elements equal to pivot
 *   RIGHT → elements larger than pivot
 * Then recursively sorts LEFT and RIGHT.
 *
 * Time Complexity:
 *   Best/Average → O(n log n) — pivot splits array evenly
 *   Worst case   → O(n²)     — pivot always min/max (sorted input)
 *   Our fix: median-of-three pivot selection avoids worst case
 *
 * Space Complexity:
 *   O(log n) — recursive call stack depth
 *
 * vs other sorts:
 *   BubbleSort → O(n²) always — too slow for large data
 *   MergeSort  → O(n log n) but O(n) extra space
 *   QuickSort  → O(n log n) avg, O(log n) space — best in practice
 */

// ── Basic QuickSort ───────────────────────────────────
// O(n log n) average
const quickSort = (arr, key = 'vote_count', order = 'desc') => {
  if (arr.length <= 1) return arr;

  // Median-of-three pivot (avoids worst case on sorted input)
  const pivotIndex = medianOfThree(arr, key);
  const pivot = arr[pivotIndex];

  const left   = arr.filter((x, i) => i !== pivotIndex && compare(x[key], pivot[key], order) < 0);
  const middle = arr.filter((x, i) => i !== pivotIndex && x[key] === pivot[key]);
  const right  = arr.filter((x, i) => i !== pivotIndex && compare(x[key], pivot[key], order) > 0);

  return [
    ...quickSort(left, key, order),
    pivot,
    ...middle,
    ...quickSort(right, key, order),
  ];
};

// ── Comparison helper ─────────────────────────────────
const compare = (a, b, order) => {
  if (order === 'desc') return b - a;
  return a - b;
};

// ── Median-of-Three pivot selection ───────────────────
// Picks median of first, middle, last elements as pivot
// Prevents O(n²) worst case on already-sorted arrays
const medianOfThree = (arr, key) => {
  const first  = 0;
  const mid    = Math.floor(arr.length / 2);
  const last   = arr.length - 1;

  const a = arr[first][key];
  const b = arr[mid][key];
  const c = arr[last][key];

  if ((a <= b && b <= c) || (c <= b && b <= a)) return mid;
  if ((b <= a && a <= c) || (c <= a && a <= b)) return first;
  return last;
};

// ── In-place partition QuickSort (Lomuto scheme) ──────
// More memory efficient — O(log n) stack space
const quickSortInPlace = (arr, key = 'vote_count', low = 0, high = arr.length - 1) => {
  if (low < high) {
    const pivotIndex = partition(arr, key, low, high);
    quickSortInPlace(arr, key, low, pivotIndex - 1);
    quickSortInPlace(arr, key, pivotIndex + 1, high);
  }
  return arr;
};

const partition = (arr, key, low, high) => {
  const pivot = arr[high][key];
  let i = low - 1;

  for (let j = low; j < high; j++) {
    if (arr[j][key] >= pivot) { // descending order
      i++;
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
  }

  [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
  return i + 1;
};

// ── Sort poll results with metadata ───────────────────
const sortPollResults = (results, sortBy = 'vote_count', order = 'desc') => {
  const validKeys = ['vote_count', 'percentage', 'option_text'];

  if (!validKeys.includes(sortBy)) {
    sortBy = 'vote_count';
  }

  const sorted = sortBy === 'option_text'
    ? [...results].sort((a, b) =>
        order === 'asc'
          ? a.option_text.localeCompare(b.option_text)
          : b.option_text.localeCompare(a.option_text)
      )
    : quickSort(results, sortBy, order);

  return {
    results: sorted,
    sortedBy: sortBy,
    order,
    algorithm: 'QuickSort',
    timeComplexity: 'O(n log n) average',
  };
};

// ── Merge Sort (for comparison/demonstration) ─────────
// O(n log n) guaranteed, O(n) extra space
const mergeSort = (arr, key = 'vote_count') => {
  if (arr.length <= 1) return arr;

  const mid = Math.floor(arr.length / 2);
  const left  = mergeSort(arr.slice(0, mid), key);
  const right = mergeSort(arr.slice(mid), key);

  return merge(left, right, key);
};

const merge = (left, right, key) => {
  const result = [];
  let i = 0, j = 0;

  while (i < left.length && j < right.length) {
    if (left[i][key] >= right[j][key]) { // descending
      result.push(left[i++]);
    } else {
      result.push(right[j++]);
    }
  }

  return [...result, ...left.slice(i), ...right.slice(j)];
};

module.exports = { quickSort, quickSortInPlace, sortPollResults, mergeSort };
