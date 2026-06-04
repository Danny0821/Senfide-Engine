# playbook.md — {{NAME}} Playbook

> [!NOTE]
> QA E2E testing, zero-dependency integration, and mock tests technical knowledge base.
> Link back to lessons_index.md using tag anchors.

---

## [TEST_TIMEOUT_01] Async E2E selector timeout in headless run
- **Issue**: Async integration test runner throws timeouts in CI.
- **Cause**: CI server latency causes delayed DOM rendering under headless operations.
- **Fix**: Boost default element locator timeouts to 10s-15s instead of short static intervals, and ensure wait states are network-idle based.
- **Code Workaround**:
  ```javascript
  // Async locator selector check workaround
  const waitForSelector = async (selector, timeout = 15000) => {
    const startTime = Date.now();
    while (Date.now() - startTime < timeout) {
      if (document.querySelector(selector)) return true;
      await new Promise(r => setTimeout(r, 100));
    }
    throw new Error(`Timeout waiting for selector: ${selector}`);
  };
  ```

---

## [MOCK_FIXTURE_01] API schema drifts breaking integration mock payloads
- **Issue**: Test mocks return obsolete mock payloads, hiding code defects.
- **Cause**: Hand-rolling mocks that drift away from active production schemas.
- **Fix**: Generate test fixtures directly from shared JSON schema contracts, or run integration contract tests (e.g. Pact).
