# 🌿 ResQHarvest: The "Zero-Waste" Intelligence Engine

> **A real-world circular platform connecting local businesses with perishable surplus to community members and food-insecure individuals, powered by Open-Source AI (Llama 3 / Ollama).**

[![License: MIT](https://img.shields.io/badge/License-MIT-emerald.svg)](LICENSE)
[![AI Engine](https://img.shields.io/badge/Open_Source_AI-Llama_3_%2F_Ollama-purple.svg)](https://ollama.ai)
[![Node.js](https://img.shields.io/badge/Runtime-Node.js_v22-green.svg)](https://nodejs.org)
[![Zero Waste](https://img.shields.io/badge/Food_Waste-Landfill_Zero-teal.svg)](#impact)

---

## 📌 The Problem
Local businesses (grocers, bakeries, restaurants) face immense financial loss from **"perishable waste"**—wholesome food near its expiration date or cosmetically imperfect ("ugly produce") that is discarded rather than sold. Simultaneously, low-income individuals and families face rising grocery costs and struggle to access fresh, nutritious food.

## 🚀 The Solution: ResQHarvest
**ResQHarvest** is an intelligent, multi-persona food rescue platform that closes the loop between surplus supply and community demand. It embeds **Open Source Large Language Models (Llama 3 / Ollama / Gemma / Qwen)** to optimize every stage of the perishable food lifecycle:

1. **Dynamic Markdown & Spoilage Valuation**: Predicts decay curves and calculates optimal discount percentages (-40% to -85%) across time windows to accelerate local consumer sales before spoilage.
2. **Zero-Waste Pantry Rescue Chef**: Empowers community members to input any arbitrary combination of rescued items (e.g., stale sourdough, freckled bananas, bruised tomatoes) to receive gourmet recipes, step-by-step cooking instructions, zero-waste preservation secrets, and sensory safety guidelines.
3. **1-Click Charity Dispatch & Tax Deduction Engine**: Automatically routes near-critical items (< 4h remaining) to local food banks and mutual aid fridges, generating official IRS §170(e)(3) tax receipts under the Bill Emerson Good Samaritan Food Donation Act.
4. **Dignified Community Access**: "Pay-What-You-Can" or $0 Free Community Shelf listings with anonymous 4-digit PINs and digital QR pickup passes.
5. **Real-Time Impact Metrics**: Quantifies diverted food (kg), greenhouse gas emissions avoided (kg CO₂e), water conserved (gallons), and dollars saved by working families.

---

## 🏛️ Platform Architecture & Personas

```
┌────────────────────────────────────────────────────────────────────────┐
│                   ResQHarvest Web Platform                             │
├────────────────────────────────┬───────────────────────────────────────┤
│ 🍎 Community Food Rescue       │ 🏪 Merchant & Grocer Portal           │
│  - Distance & Category Filters │  - Rapid Perishable Ingestion Form    │
│  - "Ugly But Good" Badges      │  - AI Markdown Curve Simulator        │
│  - QR Pass & Secret PIN Claims │  - 1-Click Food Bank Dispatch         │
├────────────────────────────────┼───────────────────────────────────────┤
│ 👨‍🍳 Llama 3 Zero-Waste Chef    │ 🧊 Community Fridges & Mutual Aid     │
│  - Rescued Ingredients Input   │  - Live Fridge Capacity Meters        │
│  - Sensory Spoilage Guide      │  - Volunteer Drop-Off Logging         │
│  - Web Speech Read-Aloud       │  - Temperature & Health Tracking      │
├────────────────────────────────┴───────────────────────────────────────┤
│ 🤖 Open-Source AI Observatory                                          │
│  - Live Ollama Proxy (:11434)  • Model Auto-Discovery (qwen, gemma, llama)│
│  - Raw Prompt Inspector        • Graceful Heuristic Fallback Engine    │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 🤖 Open-Source Model Integration

ResQHarvest connects to local **Ollama** instances (`http://127.0.0.1:11434`) out of the box through a native Node.js CORS proxy. It supports:
- **Llama 3 & Llama 3.2** (`llama3:latest`, `llama3.2:latest`, `llama3.2:1b`, `llama3.2:3b`)
- **Gemma 4** (`gemma4:12b`)
- **Qwen 3.6** (`qwen3.6:latest`)
- **Built-in Intelligent Heuristic Engine**: Guarantees zero downtime and instant responses even if the local LLM server is temporarily offline or switching weights.

### Specialized AI Prompt Modules:
- **`optimizeMarkdown()`**: Calculates decay velocity, optimal price reduction, and appealing consumer copy that celebrates aesthetic imperfections.
- **`generateRescueRecipe()`**: Produces Michelin-standard zero-waste recipes, culinary hacks (e.g. converting stale bread into golden croutons or freezing banana peels for plant fertilizer), and sensory verification checklists.
- **`calculateDonationReceipt()`**: Generates compliant IRS charitable deduction documentation with fair market value and environmental impact metrics.

---

## 🛠️ Quickstart & Local Setup

### 1. Prerequisites
- **Node.js** v18+ (tested on Node v22)
- *(Optional for live LLM inference)*: **Ollama** installed and running:
  ```bash
  ollama serve
  ollama run llama3.2
  ```

### 2. Start the Server
From the project directory:
```bash
# Start the web platform and Ollama proxy
npm start
```
The application will launch immediately at:
👉 **`http://localhost:3000`**

---

## 🌿 Environmental & Social Impact Formulae
- **CO₂e Diverted**: $2.5 \text{ kg CO}_2\text{e per kg food waste diverted}$ (EPA Waste Reduction Model).
- **Water Conserved**: $450 \text{ gallons of embedded water per kg food rescued}$ (ReFED Food Waste Calculator).
- **Meals Provided**: $450 \text{g wholesome food per nourishing meal portion}$.
