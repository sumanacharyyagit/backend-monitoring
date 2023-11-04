const getRandomValue = (array) => {
    return array[Math.floor(Math.random() * array.length)];
};

export const doHeavyTask = () => {
    const ms = getRandomValue([100, 500, 800, 1500, 2100, 2500, 3000, 4000]);
    const isError = getRandomValue([1, 2, 3, 4, 5, 6, 7, 8]) === 7;
    if (isError) {
        const errorText = getRandomValue([
            "DB Payment Failure!",
            "DB Server is Down",
            "Access Denided!",
            "Not Found Error",
        ]);
        throw new Error(errorText);
    }
    return new Promise((res, rej) => setTimeout(() => res(ms), ms));
};
