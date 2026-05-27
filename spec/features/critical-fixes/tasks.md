# Задачи

**Context:** Изучить кодовую базу и закрыть критичные дефекты, влияющие на корректность dead code анализа и CI-режим.

## Main directions

### 1. Исправить модель идентификации символов (коллизии имён)

- [ ] Обновить `src/core/DeadCodeChecker.ts` и `src/core/analysis.ts`, чтобы декларации отслеживались с file-scoped идентификатором, а не только по `name`.
- [ ] Добавить регрессионный тест в `tests/` на кейс "одинаковое имя в разных файлах", подтверждающий отсутствие перекрёстного влияния usage.
- [ ] Обновить `spec/features/critical-fixes/plan.md` при изменении архитектурного решения (если в ходе реализации выбран иной способ keying).

### 2. Исправить import binding для ESM alias и CommonJS

- [ ] Исправить разбор `import { a as b }` в `src/core/declarations.ts`, чтобы usage проверялся по локальному имени `b`.
- [ ] Исправить разбор `const local = require('pkg')` и `const local = require('pkg').member` в `src/core/declarations.ts`, чтобы трекался local binding.
- [ ] Обновить использование импортов в `src/core/analysis.ts` и формирование import-элементов отчёта в `src/core/reporting.ts` под новую модель binding.
- [ ] Добавить отдельные тест-кейсы в `tests/` для ESM alias и двух CommonJS вариантов.

### 3. Убрать ложные экспорты и исправить логику публичного API

- [ ] Исключить или ограничить использование `processReturnStatements` в pipeline (`src/core/DeadCodeChecker.ts`, `src/core/declarations.ts`) так, чтобы `return { ... }` не считался module export.
- [ ] Пересмотреть условие `isDeadCode` в `src/core/analysis.ts` для экспортов без internal import, чтобы не ломать сценарий публичного API библиотеки.
- [ ] Добавить тест в `tests/` на отсутствие ложного dead code для валидного экспортированного публичного API.

### 4. Проверка качества и верификация

- [ ] Прогнать `npm test` и зафиксировать результат.
- [ ] Выполнить smoke-run через CLI (`dead-code-checker --ci -f tests/fixtures/critical-fixes`) для сценариев "без ошибок" и "есть dead code", подтвердив корректные exit codes.
- [ ] После закрытия всех чекбоксов выполнить `/spec/core/verify.md` для `#critical-fixes#` и сохранить `spec/features/critical-fixes/verify-report.md`.

## Supporting tasks

- [ ] Documentation: обновить `README.md` (разделы про import detection и CI behavior) и при необходимости примеры в `example/`.
- [ ] Constitution: update `spec/constitution/*` if this feature introduced a new invariant, workflow constraint, or quality gate. If not required — reason: изменения ограничены исправлением логики анализа и не вводят новых process-level инвариантов.
- [ ] Observability: Not required — reason: CLI-инструмент не имеет runtime-метрик/алёртов; достаточно тестов и детерминированных fixtures.
- [ ] Code review and PR: подготовить дифф с доказательной базой по каждому багу (до/после через тесты) и описанием риска регрессии.

## Definition of Done

- [ ] Все задачи завершены и протестированы.
- [ ] Релевантные unit/integration тесты проходят успешно.
- [ ] Документация и операционные инструкции обновлены.
- [ ] Соответствие конституции проверено, `spec/constitution/*` обновлён при необходимости (иначе явно отмечено как не требующее обновления).
- [ ] `/spec/core/verify.md` выполнен после завершения всех задач для верификации task list.

## Instruction execution control

- [x] The document contains no placeholders (`{FEATURE}`, `{CONTEXT}`, `...`) or empty required sections.
- [x] Clarification handling is consistent: blocking gaps stop generation; non-blocking gaps are marked as `No data — needs clarification (see clarifications.md: #<n>)`.
- [x] Main directions, supporting tasks, and Definition of Done are synchronized with `spec.md`, `plan.md`, and `tests.md`.
