export const binarySearch = (
  f: (x: number) => number,
  target: number,
  left: number,
  right: number
): number => {
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);

    const res = f(mid);

    if (res === target) {
      return mid;
    }

    if (res < target) {
      left = mid + 1;
    }
    else {
      right = mid - 1;
    }
  }

  return -1; // Element not found
};
