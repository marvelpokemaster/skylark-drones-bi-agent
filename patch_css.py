with open("src/app/globals.css", "r") as f:
    content = f.read()

# Replace the ambient-bg::after with the intensity variable
old_bg = """  /* 4. Global Ambient Connection */
  .ambient-bg::after {
    content: "";
    position: fixed;
    inset: 0;
    background: radial-gradient(
      1200px circle at var(--pointer-x) var(--pointer-y),
      rgba(139, 92, 246, 0.05),
      rgba(34, 211, 238, 0.02) 40%,
      transparent 70%
    );
    pointer-events: none;
    z-index: 1; /* Above blobs */
  }"""

new_bg = """  /* 4. Global Ambient Connection (Soft Persistence) */
  .ambient-bg::after {
    content: "";
    position: fixed;
    inset: 0;
    background: radial-gradient(
      1400px circle at var(--pointer-x) var(--pointer-y),
      rgba(139, 92, 246, calc(0.01 + 0.05 * var(--ambient-intensity, 0))),
      rgba(34, 211, 238, calc(0.005 + 0.03 * var(--ambient-intensity, 0))) 40%,
      transparent 70%
    );
    pointer-events: none;
    z-index: 1; /* Above blobs */
    transition: background 0.1s linear;
  }"""

if old_bg in content:
    content = content.replace(old_bg, new_bg)
    with open("src/app/globals.css", "w") as f:
        f.write(content)
    print("Patched ambient-bg")
else:
    print("Could not find old ambient-bg")
