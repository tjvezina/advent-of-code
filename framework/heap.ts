/**
 * Defines heap ordering.
 * Return values:
 *   < 0  -> Correct order (a before b)
 *   = 0  -> Equal (a and b are interchangable, order undefined)
 *   > 0  -> Incorrect order (b before a)
 */
export type CompareFunc<T> = (a: T, b: T) => number;

export default class Heap<T> {
  static createNumberMinHeap(): Heap<number> {
    return new Heap<number>((a, b) => a - b);
  }

  static createNumberMaxHeap(): Heap<number> {
    return new Heap<number>((a, b) => b - a);
  }

  static createMinHeap<T>(getValueFunc: (element: T) => number): Heap<T> {
    return new Heap<T>((a, b) => getValueFunc(a) - getValueFunc(b));
  }

  static createMaxHeap<T>(getValueFunc: (element: T) => number): Heap<T> {
    return new Heap<T>((a, b) => getValueFunc(b) - getValueFunc(a));
  }

  // The heap uses a 1-based array to simplify parent <-> child index calculations
  array: T[] = new Array(1) as T[];
  #compareFunc: CompareFunc<T>;

  constructor(compareFunc: CompareFunc<T>) {
    this.#compareFunc = compareFunc;
  }

  get size(): number { return this.array.length - 1; }

  insert(element: T): void {
    this.array.push(element);
    this.#upHeap(this.size);
  }

  extract(): T | null {
    if (this.size === 0) {
      return null;
    }

    this.#swap(1, this.size);

    const element = this.array.pop()!;

    this.#downHeap(1);

    return element;
  }

  includes(element: T): boolean {
    return this.array.includes(element);
  }

  #upHeap(i: number): void {
    let iChild = i;
    while (iChild > 1) {
      const iParent = Math.floor(iChild / 2);
      if (this.#orderIsCorrect(iParent, iChild)) {
        break;
      }

      iChild = this.#swap(iChild, iParent);
    }
  }

  #downHeap(i: number): void {
    let iParent = i;
    while (true) {
      const iLeftChild = iParent * 2;
      const iRightChild = iLeftChild + 1;

      // Determine which element, between the parent and both children, should be earliest in the heap's sorting
      let iEarliest = iParent;

      if (iLeftChild <= this.size && !this.#orderIsCorrect(iEarliest, iLeftChild)) {
        iEarliest = iLeftChild;
      }
      if (iRightChild <= this.size && !this.#orderIsCorrect(iEarliest, iRightChild)) {
        iEarliest = iRightChild;
      }

      if (iEarliest === iParent) {
        break;
      }

      iParent = this.#swap(iParent, iEarliest);
    }
  }

  #orderIsCorrect(iA: number, iB: number): boolean {
    return this.#compareFunc(this.array[iA], this.array[iB]) <= 0;
  }

  #swap(iA: number, iB: number): number {
    [this.array[iA], this.array[iB]] = [this.array[iB], this.array[iA]];
    return iB;
  }
}
