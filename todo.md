# Project Nexus - Handoff & TODO for Claude

## Current State & Handoff Context
This document serves as a handoff from the previous AI agent (Antigravity). We have successfully established the fundamental architecture:
- **Backend**: A Fastify Node.js server deployed live on Render (`https://nexus-oracle-u6ra.onrender.com`).
- **Frontend**: A React Three Fiber application building and deploying continuously to Cloudflare Pages.
- **Connection**: The frontend's `CommandBar` is successfully POSTing queries to the backend's `/api/oracle/ask` endpoint and receiving data.

## User Frustration & Aesthetic Rebuild (URGENT)
**Context for Claude**: The user is extremely frustrated with how the frontend aesthetic currently looks. The previous agent (me) did a lazy, cheap, and unsatisfactory job of integrating the user's provided 3D assets (`cloud_180.ply`, `model.ply`, `galaxy.obj`). 

**Your Task**: You need to completely rebuild the aesthetic of the Oracle. 
- The user provided a monolithic HTML file (`nexus-oracle.html`) which should be used as a reference point for *at least* what a basic, clean version should look like.
- Please discard the cheap procedural implementations and elevate the 3D aesthetic to match the user's vision of a beautiful, premium space/galaxy environment.

## The Broader Vision & Future Roadmap

The application is pivoting from a pure MTG-only tool to a **General-Purpose AI**. Magic: The Gathering will just be one small aspect of its capabilities.

Please implement the following major features:

### 1. General Purpose AI & Chat History
- The AI should be able to handle general-purpose queries, not just MTG.
- **Sidebar Integration**: The left sidebar (`Spine.tsx`) must be expanded to store, manage, and display past conversations (chat history), similar to standard AI chat interfaces.

### 2. 3D Card Browser
- Implement a fully interactive 3D card browser.
- Users should be able to visually search, inspect, and sift through MTG cards in a highly polished 3D interface within the canvas.

### 3. Playable MTG Integration
- Integrate actual MTG gameplay rules and logic so the user can play full matches of Magic: The Gathering against the Oracle AI directly within the application.
- This will require sophisticated state management, a rules engine, and an interactive 3D battlefield.
