# AGENTS.md - Digital Huang Binhong Project

## Project Overview

This is a digital humanities project about the famous Chinese painter Huang Binhong (黄宾虹). The project consists of:
- **Frontend**: Vue 3 + Vue Router + Pinia + Three.js (3D gallery)
- **Backend**: Spring Boot 3.2.5 + MyBatis + PostgreSQL + Redis

---

## Build / Lint / Test Commands

### Frontend (Vue)

```bash
cd frontend

# Install dependencies (use --legacy-peer-deps to resolve peer dependency conflicts)
npm install --legacy-peer-deps

# Development
npm run serve          # Start dev server on port 3000 (configurable in vue.config.js)
npm run serve:https    # Start with HTTPS (requires key.pem and cert.pem)

# Build
npm run build          # Production build to /dist

# Linting
npm run lint           # Run ESLint
npm run lint:fix       # Fix ESLint errors automatically

# Testing
npm run test:unit      # Run Jest unit tests with coverage
npm run test:watch     # Run tests in watch mode
npm run test:ci        # Run tests for CI/CD (with coverage thresholds)

# Run a single test file
npx jest --config=jest.config.js tests/unit/YourTest.spec.js
npx jest --config=jest.config.js tests/unit/YourTest.spec.js --coverage
```

### Backend (Spring Boot)

```bash
cd backend

# Build
mvn clean package      # Build JAR file
mvn clean install     # Install to local Maven repository

# Run
mvn spring-boot:run   # Start application (default port 8081)

# Test
mvn test              # Run unit tests

# Linting (checkstyle, spotbugs, etc.)
mvn verify            # Run all checks including tests
```

---

## Code Style Guidelines

### General Principles

1. **Readability First**: Write clear, understandable code over clever code
2. **Consistency**: Follow existing patterns in the codebase
3. **Documentation**: Add JSDoc for complex functions, keep comments minimal but meaningful

### JavaScript / Vue

#### Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Components | PascalCase | `TimelinePage.vue`, `WorkGallery.vue` |
| Variables | camelCase | `activeYear`, `userProgress` |
| Constants | UPPER_SNAKE_CASE | `MAX_ZOOM_LEVEL`, `API_BASE_URL` |
| Methods | camelCase | `getYearWorkCount()`, `jumpToYear()` |
| CSS Classes | kebab-case | `.timeline-column`, `.event-detail` |
| Files (Vue) | PascalCase | `SceneManager.js` |
| Files (utils) | camelCase | `loadingManager.js` |

#### Imports

```javascript
// Vue components - relative paths preferred
import HomePage from '../views/HomePage.vue';
import TimelinePage from '@/views/TimelinePage.vue';  // @ alias allowed

// Third-party libraries
import gsap from 'gsap';
import * as THREE from 'three';
import axios from 'axios';

// Internal modules
import { getTimeline } from '@/api';
import { useDataStore } from '@/stores/dataStore';
```

#### Formatting (Prettier + ESLint)

- **Print width**: 120 characters
- **Indentation**: 2 spaces
- **Quotes**: Single quotes
- **Semicolons**: Always
- **Trailing commas**: None
- **Vue script/style indentation**: Enabled

Run `npm run lint:fix` to auto-fix most issues.

#### Vue Component Structure

```vue
<template>
  <!-- Template content -->
</template>

<script>
import gsap from 'gsap';

const CONFIG = { /* constants */ };

export default {
  name: 'ComponentName',
  props: {
    // Props definition
  },
  data() {
    return {
      // Reactive data
    };
  },
  computed: {
    // Computed properties (use Maps for O(1) lookups)
  },
  methods: {
    // Methods
  },
  mounted() {
    // Lifecycle hooks
  },
  beforeUnmount() {
    // Cleanup
  }
};
</script>

<style scoped>
/* Component styles */
</style>
```

#### Error Handling

```javascript
// Always use try-catch for async operations
async fetchData() {
  try {
    const response = await api.getData();
    return response.data;
  } catch (error) {
    console.error('Failed to fetch data:', error);
    // Handle error appropriately
    return null;
  }
}

// Use optional chaining and nullish coalescing
const value = data?.property ?? defaultValue;
```

### Java / Spring Boot

#### Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Classes | PascalCase | `LifeTimelineController`, `ApiResponse` |
| Methods | camelCase | `getLifeTimelineList()` |
| Variables | camelCase | `timelineService`, `userProgress` |
| Constants | UPPER_SNAKE_CASE | `MAX_PAGE_SIZE` |
| Packages | lowercase | `org.qingliul.digitalhuangbinhon.controller` |

#### Code Structure

```java
@RestController
@RequestMapping("/api/timeline")
public class LifeTimelineController {

    @Autowired
    private LifeTimelineService lifeTimelineService;

    /**
     * Get timeline list with pagination
     * @param year Optional year filter
     * @param page Page number (default: 1)
     * @param size Page size (default: 10)
     */
    @GetMapping("/list")
    public ApiResponse<Map<String, Object>> getLifeTimelineList(
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false, defaultValue = "1") Integer page,
            @RequestParam(required = false, defaultValue = "10") Integer size) {
        
        Map<String, Object> result = lifeTimelineService.getLifeTimelineList(year, page, size);
        return ApiResponse.success(result);
    }
}
```

#### Error Handling

- Use `ApiResponse` wrapper for all controller responses
- Return appropriate HTTP status codes
- Log errors with meaningful messages

---

## Testing Guidelines

### Frontend Testing

- Test files location: `tests/unit/` and `tests/integration/`
- Naming: `*.spec.js` or `*.test.js`
- Coverage thresholds: 70% for branches, functions, lines, statements
- Run specific test: `npx jest --config=jest.config.js path/to/test.spec.js`

### Backend Testing

- Test files location: `src/test/java/`
- Use JUnit 5 and Spring Boot Test
- Follow naming: `*ServiceTest.java`, `*ControllerTest.java`

---

## Git Workflow

1. Create feature branch: `git checkout -b feature/timeline-optimization`
2. Make changes and commit: `git commit -m "Add timeline visualization"`
3. Push to remote: `git push origin feature/timeline-optimization`
4. Create Pull Request for review

---

## Important Notes

### Frontend

- Use `npm install --legacy-peer-deps` to avoid dependency conflicts
- Dev server runs on port **3000** (configured in vue.config.js)
- API proxy forwards `/api/*` to `http://localhost:8081`
- Three.js is used for 3D gallery - check `src/three/` directory
- Legacy Vuex store in `src/store/`, consider using Pinia for new features

### Backend

- Default port: **8081**
- PostgreSQL database required
- Redis for caching
- MyBatis for database access

### Known Issues

- Three.js version 0.181.2 has some deprecated exports (e.g., `sRGBEncoding`)
- Some npm packages have security warnings - run `npm audit` periodically

---

## Documentation

- Frontend: `/frontend/docs/` directory contains design and technical specs
- Backend: Spring Boot with Knife4j for API documentation at `/doc.html`
