# DataMastery

DataMastery is an open-source, interactive learning platform designed to train junior analysts into senior software engineers and data practitioners. It replaces dry documentation with an interactive, conversational mentor (Maya) inside an in-browser Python IDE.

## Features
- **In-Browser Execution**: Runs a full Python stack locally using Pyodide and WebAssembly. No server-side execution required.
- **Interactive Mentor**: A custom conversational engine (`ConversationEngine`) that acts like a senior colleague.
- **Mission Engine**: Curriculum is defined in data structures, completely decoupled from React components.
- **Robust Validation**: `ValidationEngine` supports semantic DataFrame validations without string matching.
- **Accessibility**: Full keyboard navigation, screen reader support, and WCAG-compliant color contrast.
- **High Performance**: Optimized with React lazy loading, local storage fallback persistence, and minimal re-renders.

## Architecture
See [ARCHITECTURE.md](./ARCHITECTURE.md) for a detailed diagram of the decoupled engine systems.

## Getting Started

### Prerequisites
- Node.js (v20+)
- npm (v10+)

### Installation
```bash
git clone https://github.com/your-org/datamastery.git
cd datamastery
npm install
```

### Running Locally
```bash
npm run dev
```

### Running Tests
DataMastery is fully unit-tested (Vitest) and End-to-End tested (Playwright).
```bash
# Run unit & integration tests
npm test

# Run E2E tests
npm run test:e2e
```

## Contributing
We welcome contributions! See [CONTRIBUTING.md](./CONTRIBUTING.md) for details on how to set up your environment, our code style (Prettier + ESLint), and the conventional commits process.

## License
MIT License. See [LICENSE](./LICENSE) for more information.
