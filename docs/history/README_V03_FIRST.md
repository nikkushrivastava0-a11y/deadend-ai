# DeadEnd AI — v0.3 3D evidence workspace

## Run on Windows (recommended)
1. Extract the ZIP completely.
2. Open the extracted folder **containing `package.json` and `START_DEADEND_WINDOWS.cmd`**.
3. Double-click **START_DEADEND_WINDOWS.cmd**.
4. Open **http://localhost:3001** in Chrome.

Or from PowerShell in the extracted project directory: `npm start`.

**Why port 3001?** Your earlier DeadEnd v0.1 may still be running at localhost:3000. The new version uses 3001 to avoid loading the old design by mistake.

## Demo
Open http://localhost:3001, drag the evidence constellation, click each floating card, then select **Open an example case**. The demo uses fictional sources. Review public and restricted findings, and download a public-only approved handover.

## Round 2 honest scope
The app is runnable locally with deterministic candidate extraction, evidence lookup, manual review and handover generation. Authentication, multi-user persistence, a model-backed extractor and public deployment are not yet implemented. It must not be represented as a secure production deployment.
