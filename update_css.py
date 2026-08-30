import re

with open("src/app/globals.css", "r") as f:
    content = f.read()

# Add CSS for the frost material system
material_css = """
/* === ONE PHYSICAL MATERIAL SYSTEM === */
:root {
  --pointer-x: 50vw;
  --pointer-y: 50vh;
}

/* Base structural fixes for pseudo-elements */
.glass-shell, .glass-panel, .glass-elevated {
  position: relative;
  /* overflow: hidden removed so masks work without clipping outer borders if needed, but keeping borders contained */
}

/* Only apply pointer-driven lighting on fine pointers (desktop) */
@media (pointer: fine) and (prefers-reduced-motion: no-preference) {
  
  /* 4. Global Ambient Connection */
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
  }

  /* 3. Glass Surfaces - Specular reflection */
  .glass-shell::before, .glass-panel::before, .glass-elevated::before {
    content: "";
    position: absolute;
    inset: 0;
    border-radius: inherit;
    background: radial-gradient(
      600px circle at var(--pointer-x) var(--pointer-y),
      rgba(255, 255, 255, 0.04),
      transparent 40%
    ) fixed;
    pointer-events: none;
    z-index: 0;
  }

  /* 5. Borders - Reacting to pointer */
  .glass-shell::after, .glass-panel::after, .glass-elevated::after {
    content: "";
    position: absolute;
    inset: 0;
    border-radius: inherit;
    padding: 1px;
    background: radial-gradient(
      400px circle at var(--pointer-x) var(--pointer-y),
      rgba(139, 92, 246, 0.4),
      transparent 50%
    ) fixed;
    -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
    pointer-events: none;
    z-index: 1;
  }

  /* 6. Buttons */
  button.bg-panel-800, button.bg-gradient-primary {
    position: relative;
    overflow: hidden;
  }
  button.bg-panel-800::before, button.bg-gradient-primary::before {
    content: "";
    position: absolute;
    inset: 0;
    border-radius: inherit;
    background: radial-gradient(
      150px circle at var(--pointer-x) var(--pointer-y),
      rgba(255, 255, 255, 0.15),
      transparent 100%
    ) fixed;
    pointer-events: none;
    z-index: 0;
  }
  
  /* 9. Sector Matrix Table Rows */
  tbody tr {
    position: relative;
    transition: background-color 0.2s ease;
  }
  tbody tr:hover {
    background: radial-gradient(
      800px circle at var(--pointer-x) var(--pointer-y),
      rgba(255, 255, 255, 0.03),
      transparent 40%
    ) fixed;
    box-shadow: inset 0 1px 0 0 rgba(139, 92, 246, 0.1), inset 0 -1px 0 0 rgba(139, 92, 246, 0.1);
  }

  /* 7. Chat Bubbles */
  .chat-bubble {
    position: relative;
    overflow: hidden;
  }
  .chat-bubble::before {
    content: "";
    position: absolute;
    inset: 0;
    border-radius: inherit;
    background: radial-gradient(
      400px circle at var(--pointer-x) var(--pointer-y),
      rgba(255, 255, 255, 0.05),
      transparent 40%
    ) fixed;
    pointer-events: none;
  }
  
  /* 2. Body / Label Text */
  .frost-text-subtle {
    transition: color 0.2s ease, text-shadow 0.2s ease;
  }
  .frost-text-subtle:hover {
    color: rgba(255, 255, 255, 0.95);
    text-shadow: 0 0 12px rgba(255, 255, 255, 0.2);
  }
}
"""

with open("src/app/globals.css", "a") as f:
    f.write(material_css)
