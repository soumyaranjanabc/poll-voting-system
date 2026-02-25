/**
 * BINARY SEARCH
 * ─────────────
 * Used for: Searching polls by title prefix
 *
 * Binary Search works on SORTED arrays by repeatedly halving
 * the search space. Compare middle element → go left or right.
 *
 * Time Complexity:
 *   binarySearch()       → O(log n)  vs linear search O(n)
 *   sortPolls()          → O(n log n) — must sort before searching
 *   findAllMatches()     → O(log n + k) where k = number of matches
 *
 * Space Complexity: O(1) iterative, O(log n) recursive call stack
 *
 * Why better than linear search?
 *   1000 polls → linear: up to 1000 comparisons
 *   1000 polls → binary: at most 10 comparisons (log2(1000) ≈ 10)
 */

// ── Step 1: Sort polls alphabetically by title ─────────
// Uses JavaScript's built-in sort (TimSort — O(n log n))
const sortPollsByTitle = (polls) => {
  return [...polls].sort((a, b) =>
    a.title.toLowerCase().localeCompare(b.title.toLowerCase())
  );
};

// ── Step 2: Binary Search — find first match ──────────
// Returns index of first poll whose title starts with query
// Returns -1 if not found
// O(log n)
const binarySearchFirst = (sortedPolls, query) => {
  let left = 0;
  let right = sortedPolls.length - 1;
  let result = -1;
  query = query.toLowerCase();

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    const title = sortedPolls[mid].title.toLowerCase();

    if (title.startsWith(query)) {
      result = mid;       // found a match, but keep going left to find FIRST
      right = mid - 1;
    } else if (title < query) {
      left = mid + 1;     // query is ahead alphabetically
    } else {
      right = mid - 1;    // query is behind alphabetically
    }
  }

  return result;
};

// ── Step 3: Find ALL matches starting from first match ─
// O(log n + k) where k = number of matches
const findAllMatches = (sortedPolls, query) => {
  const firstIndex = binarySearchFirst(sortedPolls, query);
  if (firstIndex === -1) return [];

  const matches = [];
  query = query.toLowerCase();

  // Expand right from first match
  let i = firstIndex;
  while (i < sortedPolls.length &&
         sortedPolls[i].title.toLowerCase().startsWith(query)) {
    matches.push(sortedPolls[i]);
    i++;
  }

  return matches;
};

// ── Main search function ───────────────────────────────
const searchPolls = (polls, query) => {
  if (!query || query.trim() === '') return polls;

  const sorted = sortPollsByTitle(polls);
  const matches = findAllMatches(sorted, query.trim());

  return {
    results: matches,
    totalFound: matches.length,
    totalPolls: polls.length,
    algorithm: 'Binary Search',
    timeComplexity: 'O(log n)',
  };
};

// ── Exact binary search (find by exact title) ─────────
// O(log n)
const binarySearchExact = (sortedPolls, title) => {
  let left = 0;
  let right = sortedPolls.length - 1;
  title = title.toLowerCase();

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    const current = sortedPolls[mid].title.toLowerCase();

    if (current === title) return sortedPolls[mid];
    else if (current < title) left = mid + 1;
    else right = mid - 1;
  }

  return null;
};

module.exports = { searchPolls, binarySearchExact, sortPollsByTitle, findAllMatches };
