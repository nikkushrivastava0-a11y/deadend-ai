# DeadEnd v0.3 — three-dimensional investigation workspace

## Design reference
Based on user's screenshot of stacked, isometric, translucent glass panels lit with cyan and violet accents. This is an original layout and custom CSS implementation, not an extracted reference image or a static screenshot.

## Interactions
- Drag the constellation to rotate the full 3D scene.
- Select any of five node cards to inspect the corresponding workflow stage and navigate into the real product.
- Use Reset View to return to the default isometric angle.
- The rest of the application is kept in readable 2D form so evidence quotes and approval actions can be used.

## Implementation disclosure
This version uses CSS `perspective`, `transform-style: preserve-3d`, `translate3d` and JavaScript pointer input. **It does not use Three.js, React Three Fiber or WebGL** and does not claim to. True mesh-based 3D is a later, optional design enhancement. This avoids adding an online dependency to an offline runnable MVP.

## Known limitations
- No login or tenant isolation, local demo only; not secure for private sources.
- In-memory state resets when the server restarts.
- Regex/rule-based extraction only, not a trained model.
- GitHub live import depends on public GitHub API access.
- Node scene is a conceptual visualization; it does not spatially model live relationships between specific issues. Counts update from the actual backend.
- Browser screenshot automation was blocked in the execution environment. HTML, JS, server endpoints, and engine tests were checked; visuals should be inspected in a user browser.
