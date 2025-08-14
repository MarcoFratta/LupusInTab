export function shuffleInPlace<T>(array: T[]): T[] {
	for (let i = array.length - 1; i > 0; i -= 1) {
		const j = Math.floor(Math.random() * (i + 1));
		[array[i], array[j]] = [array[j], array[i]];
	}
	return array;
}

export function shuffled<T>(array: T[]): T[] {
	return shuffleInPlace(array.slice());
}


