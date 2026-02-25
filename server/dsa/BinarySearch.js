const sortPollsByTitle = (polls) => {
  return [...polls].sort((a, b) =>
    a.title.toLowerCase().localeCompare(b.title.toLowerCase())
  );
};

const binarySearchFirst = (sortedPolls, query) => {
  let left = 0;
  let right = sortedPolls.length - 1;
  let result = -1;
  query = query.toLowerCase();

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    const title = sortedPolls[mid].title.toLowerCase();

    if (title.startsWith(query)) {
      result = mid;
      right = mid - 1;
    } else if (title < query) {
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }

  return result;
};

const findAllMatches = (sortedPolls, query) => {
  const firstIndex = binarySearchFirst(sortedPolls, query);
  if (firstIndex === -1) return [];

  const matches = [];
  query = query.toLowerCase();

  let i = firstIndex;
  while (
    i < sortedPolls.length &&
    sortedPolls[i].title.toLowerCase().startsWith(query)
  ) {
    matches.push(sortedPolls[i]);
    i++;
  }

  return matches;
};

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

module.exports = {
  searchPolls,
  binarySearchExact,
  sortPollsByTitle,
  findAllMatches,
};