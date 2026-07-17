# Contributing to DataMastery

First off, thank you for considering contributing to DataMastery! 

## Developer Experience (10-minute setup)
1. Clone the repo: `git clone https://github.com/your-org/datamastery.git`
2. Install: `npm install`
3. Run dev server: `npm run dev`
4. Run tests: `npm test`

## Code Standards
- We use **Prettier** for formatting and **ESLint** for static analysis.
- **Husky** and **lint-staged** will automatically format your code and run linters when you try to commit. 
- Please use **Conventional Commits** (e.g., `feat: added validation`, `fix: error boundary typo`).

## Pull Request Process
1. Create a feature branch.
2. Ensure `npm test` and `npm run build` pass locally.
3. Open a PR. GitHub Actions will run the test suite and Playwright E2E tests automatically. No PR can be merged without 100% test passing.
