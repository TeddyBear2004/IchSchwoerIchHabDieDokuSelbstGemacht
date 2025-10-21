import { useState } from "react";

export default function Popup() {
    const [count, setCount] = useState(0);
    return (
        <div className="p-4 w-60">
            <h1>React Extension</h1>
            <button onClick={() => setCount(c => c + 1)}>
                Count: {count}
            </button>
        </div>
    );
}
