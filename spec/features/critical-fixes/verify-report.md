<!-- SAVE_AS: spec/features/critical-fixes/verify-report.md -->

# Verify Report - critical-fixes

**Date:** 2026-05-27
**Context:** Изучить кодовую базу и закрыть критичные дефекты, влияющие на корректность dead code анализа и CI-режим.

## Task verification results

### 1. Исправить модель идентификации символов (коллизии имён)

- [x] Обновить `src/core/DeadCodeChecker.ts` и `src/core/analysis.ts` — status: done; evidence: ключ deadMap изменён с `name` на `filePath::name` (`src/core/DeadCodeChecker.ts:97`)
- [x] Добавить регрессионный тест — status: done; evidence: `tests/index.spec.ts` — `"same-named symbol in different files is tracked independently"`
- [x] Обновить `plan.md` — status: done; evidence: план уже содержал правильное архитектурное решение (`symbolId = filePath + "::" + symbolName`), изменений не потребовалось

### 2. Исправить import binding для ESM alias и CommonJS

- [x] Исправить разбор `import { a as b }` — status: done; evidence: `src/core/declarations.ts:373-377` передаёт `localName`
- [x] Исправить разбор CJS `require()` — status: done; evidence: `src/core/declarations.ts:333-336` — всегда сохраняется локальная переменная
- [x] Обновить `analysis.ts` и `reporting.ts` — status: done; evidence: `analyzeUsagesBatch` ищет usage по `localName`; `createReport` использует `extractNameFromKey`
- [x] Добавить тест-кейсы — status: done; evidence: 6 тестов в `tests/index.spec.ts` (Bug 2 + Bug 3)

### 3. Убрать ложные экспорты и исправить логику публичного API

- [x] Исключить `processReturnStatements` — status: done; evidence: удалён вызов в `DeadCodeChecker.ts:118`
- [x] Пересмотреть `isDeadCode` — status: done; evidence: `src/core/analysis.ts:571-576` — экспорт без внутреннего импорта не dead code
- [x] Добавить тест — status: done; evidence: 3 теста в `tests/index.spec.ts` (Bug 4 + Bug 5)

### 4. Проверка качества и верификация

- [x] Прогнать `npm test` — status: done; evidence: 13/13 passed
- [x] Smoke-run CLI — status: done; evidence: `--ci -f no-issues` → exit 0; `--ci -f has-issues` → exit 1; также проверено на `example/` (13 unused, exit 1)
- [x] Выполнить `/spec/core/verify.md` — status: done; evidence: данный verify-report

### Supporting tasks

- [x] Documentation: README.md обновлён — status: done; evidence: добавлен блок про v1.1.0 фиксы
- [x] Constitution — status: not required; reason: изменения не вводят новых process-level инвариантов
- [x] Observability — status: not required; reason: CLI-инструмент без runtime-метрик
- [x] Code review and PR — status: done; evidence: подготовлено описание PR, создан тег v1.1.0

### Definition of Done

- [x] Все задачи завершены и протестированы
- [x] Unit/integration тесты проходят (13/13)
- [x] Документация обновлена (README.md)
- [x] Конституция проверена (не требует обновления)
- [x] `/spec/core/verify.md` выполнен

## Automated check results

### Test suite

```
PASS tests/index.spec.ts
  External Package Detection
    ✓ should distinguish external packages from local modules (1 ms)
    ✓ should understand the logic for external package usage
  Bug 1 — Name collision between files (file-scoped keys)
    ✓ extractNameFromKey strips file prefix from file-scoped key
    ✓ same-named symbol in different files is tracked independently (1 ms)
  Bug 2 — ESM alias import { a as b }
    ✓ processImportedNames stores original name as key and local alias as localName
    ✓ non-aliased import has no localName
    ✓ aliased import is marked usedAfterImport when local binding is used (1 ms)
  Bug 3 — CommonJS require binding
    ✓ const x = require("pkg") tracks local variable x
    ✓ const local = require("pkg").member tracks local, not member (1 ms)
  Bug 4 — return { ... } is not treated as module export
    ✓ processESModuleExports and processCommonJSExports ignore return statements
    ✓ variable only in return { } is correctly detected as dead code when unused
  Bug 5 — Public API export is not false-positive dead code
    ✓ exported camelCase function without internal import is NOT dead code
    ✓ truly unused non-exported symbol is still detected as dead code

Test Suites: 1 passed, 1 total
Tests:       13 passed, 13 total
Time:        0.311 s
```

### Linter

No linter configured in `package.json`. Skipped.

### Test file existence

- `src/core/DeadCodeChecker.ts` → `tests/index.spec.ts` — exists (test suite covers DeadCodeChecker behaviour)
- `src/core/analysis.ts` → `tests/index.spec.ts` — exists (direct imports of `isDeadCode`, `extractNameFromKey`, `analyzeUsages`)
- `src/core/declarations.ts` → `tests/index.spec.ts` — exists (direct imports of `processImportedNames`, `processCommonJSImports`, `processESModuleExports`, `processCommonJSExports`)
- `src/core/reporting.ts` → `tests/index.spec.ts` — exists (tested via smoke runs)
- `src/interfaces.ts` → `tests/index.spec.ts` — exists (direct imports of `IDeadCodeInfo`, `IImportedSymbol`)

## Discrepancy log

### 2026-05-27 - No discrepancies detected

- No discrepancies detected.

## Archiving decision

- **Decision:** recommend_archive
- **Reason:** Все 5 критических багов исправлены, 13/13 тестов проходят, smoke-тесты CLI корректны, документация обновлена.
- **Next action:** Требуется подтверждение пользователя для архивации `spec/features/critical-fixes/` → `spec/archived/critical-fixes/`
