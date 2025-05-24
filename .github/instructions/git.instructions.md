---
applyTo: '**'
---

# Git & GitHub Workflow

## Branching Strategy

- **main**: Production-ready code
- **develop**: Integration branch for completed features (optional)
- **feature/<scope>/<description>**: New feature development
- **fix/<scope>/<description>**: Bugfix branches
- **chore/<description>**: Maintenance or miscellaneous tasks
- **hotfix/<description>**: Urgent fixes on production

## Commit Message Standards (Conventional Commits)

Adhere to the [Conventional Commits specification](https://www.conventionalcommits.org):

```
<type>(<scope>): <subject>

<body>

<footer>
```

- **type**: feat, fix, docs, style, refactor, perf, test, chore
- **scope**: optional, between parentheses, describes affected area
- **subject**: short summary (use imperative, lower-case)

**Examples:**

```
feat(auth): add OAuth2 login flow
fix(api): correct error handling in user router
docs(readme): update installation instructions
perf(database): optimize post query performance
```

### Breaking Changes

Include `BREAKING CHANGE:` in the footer to document breaking API changes:

```
feat(ui): redesign button component

BREAKING CHANGE: component prop names have changed
```

## Pull Request Guidelines

- **Title**: Use Conventional Commits header (omit body and footer)
- **Description**: Provide context, motivation, and screenshots if applicable
- **Linked Issues**: Reference issue numbers (e.g., `Closes #123`)
- **Reviewers**: Assign at least one reviewer
- **Labels**: Use labels like `enhancement`, `bug`, `docs`
- **Merge Strategy**: Squash and merge to keep history clean
- **Draft PRs**: Mark work-in-progress PRs as drafts

## Tagging and Releases

- Follow [Semantic Versioning](https://semver.org): `MAJOR.MINOR.PATCH`
- Create annotated tag for release:
  ```bash
  git tag -a v1.2.3 -m "Release v1.2.3"
  git push origin v1.2.3
  ```
- Maintain a `CHANGELOG.md` using the [Keep a Changelog](https://keepachangelog.com) format

## Additional Best Practices

- Rebase feature branches onto `main` before merging to minimize conflicts
- Keep pull requests focused (small, self-contained changes)
- Use interactive rebase (`git rebase -i`) to clean up commit history
- Regularly prune stale branches and keep the repository tidy
