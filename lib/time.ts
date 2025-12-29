export function getNow(headers?: Headers): number {
    if (process.env.TEST_MODE === "1" && headers) {
        const fakeNow = headers.get("x-test-now-ms");
        if (fakeNow) return Number(fakeNow);
    }
    return Date.now();
}
