# DeadEnd v0.2 — investigation desk redesign

This revision replaces the generic dashboard-first layout with an investigation-desk interface. The visual metaphor is a stack of source evidence that becomes a reviewed case file.

## Design references
- `Leonxlnx/taste-skill`, design-taste-frontend: subject-led art direction, real product actions, avoid AI-generated-looking boilerplate.
- `elayadesign/ai-design-skills`, landing-page-design: deliberate hierarchy, restrained motion, usable controls.
- User preference: interactive 3D/physical depth, not fake metrics or generic gradient/card grids.

## Implemented
- Three-layer CSS pseudo-3D evidence composition responding to pointer movement; reduced-motion respected.
- Dark navigation and editorial, high-contrast application typography; blue/orange accents.
- Redesigned overview, source panels, case files and handover presentation.
- Existing backend and source-import/review/download flows preserved.

## Still needed
- Browser-based visual review across desktop/tablet/mobile: automated headless screenshot not completed here.
- Security/authentication, persistent storage, model-assisted extraction, production deployment.
- Public demo should use only synthetic and expressly authorised content.

Do not claim this local prototype is deployed or security-complete.
