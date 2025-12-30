"use client"


export default function Error({ error, reset }: { error: Error; reset: () => void }) {
    return (
        <main className="container">
            <h1 className="title">Something went wrong!</h1>
            <p className="error-message">{error.message}</p>
            <button className="btn" onClick={() => reset()}>Try again</button>
        </main>
    );
}