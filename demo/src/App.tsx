import { useState } from "react";
import { WhyRenderDevTools } from "@mouaad_idoufkir/why-render/ui";
import { useWhyRender } from "@mouaad_idoufkir/why-render";

function ChildComponent({ value }: { value: number }) {
  // Tracking this component
  useWhyRender({ value }, "ChildComponent", { verbose: true });

  return (
    <div
      style={{
        padding: "15px",
        background: "#1e1e2f",
        color: "white",
        borderRadius: "12px",
        marginTop: "20px",
      }}
    >
      <h3>Child Component</h3>
      <p>Received value: {value}</p>
    </div>
  );
}

function DeepChild({ user }: any) {
  useWhyRender({ user }, "DeepChild");

  return (
    <div
      style={{
        marginTop: "15px",
        padding: "15px",
        background: "#2e2e42",
        color: "white",
        borderRadius: "12px",
      }}
    >
      <h4>Deep Child</h4>
      <p>Name: {user.name}</p>
      <p>Level: {user.level}</p>
    </div>
  );
}

function App() {
  const [count, setCount] = useState(0);
  const [user, setUser] = useState({ name: "Mouaad idoufkir ", level: 1 });

  // Track the main App for debugging
  useWhyRender({ count, user }, "App", { verbose: true });

  return (
    <>
      {/* WhyRender Toolbar */}
      <WhyRenderDevTools />

      <div style={{ padding: "40px", textAlign: "center" }}>

        {/* Button 1 — Simple re-render */}
        <button
          onClick={() => setCount((c) => c + 1)}
          style={{
            padding: "12px 20px",
            fontSize: "18px",
            borderRadius: "10px",
            cursor: "pointer",
            background: "#646cff",
            color: "white",
            border: "none",
            marginRight: "10px",
          }}
        >
          Increment Count ({count})
        </button>

        {/* Button 2 — Prop mutation triggers deep re-render */}
        <button
          onClick={() => setUser({ ...user, level: user.level + 1 })}
          style={{
            padding: "12px 20px",
            fontSize: "18px",
            borderRadius: "10px",
            cursor: "pointer",
            background: "#ff6b81",
            color: "white",
            border: "none",
          }}
        >
          Level Up User ({user.level})
        </button>

        {/* First child */}
        <ChildComponent value={count} />

        {/* Deep nested child */}
        <DeepChild user={user} />

        <p style={{ marginTop: "20px", opacity: 0.7 }}>
          Click buttons and watch WhyRender DevTools show all re-renders, prop
          diffs, and flame graph updates in real-time.
        </p>
      </div>
    </>
  );
}

export default App;
