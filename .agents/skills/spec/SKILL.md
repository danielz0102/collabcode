---
name: spec
description: Write a detailed specification for a change in the codebase.
---

# Specification

A specification is a Markdown file with a detailed description and instructions for a change in the codebase. It should include the following:

## Frontmatter

The frontmatter is a YAML block at the top of the spec that includes metadata about the change. It should include:

- `id`: Number of the spec, e.g., `001`
- `date`: The date the spec was created, in `DD-MM-YYYY` format.
- `status`: The status of the spec, which can be `pending` or `completed`

## Title

The title should be a descriptive title for the change, e.g., `User Authentication`.

## Filename

- The filename should have the format `ID-title.md`, e.g., `001-user-authentication.md`.

## Overview

The goal of the task and a general description of the strategy for implementing it. It also includes any relevant context like:

- Decisions made during planning
- Alternative approaches that were considered and why they were ruled out

## Tasks

List of tasks that need to be completed to implement the change. Each task should include:

- Numbered, descriptive title.
- What other tasks it depends on (if any)
- Detailed instructions that include what files to modify and what changes to make.

## Testing

Description if the change requires unit, integration, or end-to-end tests. If so, include for each type of test a table with the following:

- Use case
- Input data
- Expected output

## Checklist

This is a checklist of all the tasks. Each item is a checkbox that can be marked as completed. It also includes a checkbox for tests passing. For example:

```md
- [ ] Task 1
- [ ] Task 2
- [ ] Task 3
- [ ] All tests pass
```
