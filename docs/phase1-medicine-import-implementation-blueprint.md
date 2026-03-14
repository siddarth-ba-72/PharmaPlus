# Phase 1 Implementation Blueprint - Medicine Import

## 1) Phase Goal
Deliver a production-safe, non-autonomous import workflow that supports:
- Excel upload
- deterministic mapping and validation
- admin review and approval
- asynchronous row execution against existing medicine create API
- retry and reporting

## 2) Definition of Phase 1 Done
- Admin can upload a template-compatible Excel and get preview results.
- System validates all required fields and category codes.
- Admin can correct row data before approval.
- Approved rows are processed asynchronously with retry policy.
- Row and job outcomes are visible in UI and persisted in DB.
- Idempotency avoids duplicate medicine creation when retrying.
- Audit trail exists for all key actions and transitions.

## 3) Team Workstreams
- Backend API and domain logic
- Queue worker and orchestration
- Frontend upload/review/progress screens
- QA automation and data scenario testing
- DevOps setup for queue, storage, and monitoring

## 4) Endpoint-by-Endpoint Task Breakdown

## 4.1 POST /pp/webapp/api/admin/medicine-imports/uploads
Purpose:
- Start upload session and return signed URL (or storage upload contract).

Backend tasks:
- Add controller handler and request DTO validation.
- Validate filename, mimeType, and sizeBytes against policy.
- Create upload session record with expiry.
- Generate signed upload URL from storage provider.
- Return uploadId + uploadUrl + constraints.

Security tasks:
- ADMIN role authorization.
- Rate limit endpoint by user.

Test tasks:
- Unit test DTO validation failures.
- Integration test signed URL generation success.
- Negative test for unsupported MIME and large file.

Acceptance criteria:
- Invalid file metadata returns 400 with clear reason.
- Valid request returns 201 with upload session payload.

## 4.2 POST /pp/webapp/api/admin/medicine-imports/uploads/{uploadId}/complete
Purpose:
- Confirm file upload is complete and discover basic sheet metadata.

Backend tasks:
- Verify upload session exists and not expired.
- Verify object exists in storage and checksum (if present).
- Persist sourceFileKey against upload session.
- Parse workbook lightweight metadata (sheet names, rough row count).
- Return sheet list and detected header row candidates.

Test tasks:
- Integration test for expired upload session.
- Integration test for missing storage object.
- Happy path sheet discovery test.

Acceptance criteria:
- Missing file object fails with 404/400.
- Successful completion returns sheet and header hints.

## 4.3 POST /pp/webapp/api/admin/medicine-imports/jobs
Purpose:
- Create dry-run preview job: parse, map, validate, and persist row-level results.

Backend tasks:
- Add Job aggregate and DB persistence models.
- Parse selected sheet and selected header row.
- Normalize row values (trim, stringify, empty-to-null policy).
- Apply deterministic mapping from synonym dictionary.
- Mark unmapped or ambiguous columns for review.
- Validate rows (required fields, category existence, code format, duplicates).
- Persist ImportJob summary and ImportRow records.
- Emit REVIEW_REQUIRED state.

AI placeholder tasks (phase 1 minimal):
- Keep interface boundary for AI mapper but use deterministic mapper implementation by default.

Test tasks:
- Unit tests for mapping dictionary behavior.
- Unit tests for validation rules and error codes.
- Integration test with sample workbook covering valid/invalid rows.

Acceptance criteria:
- Job state reaches REVIEW_REQUIRED with summary counts.
- Row-level errors are queryable and deterministic.

## 4.4 GET /pp/webapp/api/admin/medicine-imports/jobs/{jobId}
Purpose:
- Fetch job summary, mapping summary, and aggregate counters.

Backend tasks:
- Query job by id with authorization check.
- Return current state + aggregate counters + timestamps.
- Include mapping decisions and confidence placeholders.

Test tasks:
- Integration test for existing job summary retrieval.
- Negative test for unauthorized or unknown job id.

Acceptance criteria:
- Endpoint returns full summary in under agreed p95 target for typical jobs.

## 4.5 GET /pp/webapp/api/admin/medicine-imports/jobs/{jobId}/rows
Purpose:
- Paginated row list with filter by validation/execution status.

Backend tasks:
- Add pagination and filtering query params.
- Return rowNumber, mappedPayload, validation status, execution status, errors.
- Support sorting by rowNumber.

Test tasks:
- Pagination correctness tests.
- Filter tests for INVALID, READY, FAILED_RETRYABLE.

Acceptance criteria:
- UI can fetch only invalid rows and display error reasons.

## 4.6 PATCH /pp/webapp/api/admin/medicine-imports/jobs/{jobId}/rows/{rowNumber}
Purpose:
- Admin overrides selected fields and re-validates row.

Backend tasks:
- Validate allowed override fields.
- Apply patch to mappedPayload.
- Re-run row-level validation.
- Update row status and errors.
- Append audit event with actor and diff.

Test tasks:
- Unit tests for allowed field whitelist.
- Integration test for successful fix from INVALID to READY.

Acceptance criteria:
- Corrected row immediately reflects updated validation outcome.

## 4.7 POST /pp/webapp/api/admin/medicine-imports/jobs/{jobId}/approve
Purpose:
- Lock review and enqueue asynchronous execution.

Backend tasks:
- Ensure job state is REVIEW_REQUIRED.
- Enforce policy (for example block approval if invalid rows exceed threshold).
- Freeze editable review state.
- Persist execution configuration (concurrency, retries, stop-on-error threshold).
- Publish queue job and move state to QUEUED.

Test tasks:
- State transition tests for allowed/disallowed approvals.
- Queue publish integration test.

Acceptance criteria:
- Approved job cannot be edited.
- Queue dispatch succeeds and state changes to QUEUED.

## 4.8 Worker Flow (internal) for execution
Purpose:
- Process READY rows and call medicine create API for each row.

Worker tasks:
- Pull row from queue payload by jobId.
- Build idempotency key for row operation.
- Invoke medicine create endpoint via internal service adapter.
- Handle API outcomes:
  - 2xx -> SUCCESS
  - retryable failures (timeouts/5xx) -> FAILED_RETRYABLE + requeue
  - business failures (4xx) -> FAILED_PERMANENT
- Update ImportRow and ImportJob counters atomically.
- Emit progress events to event stream.

Test tasks:
- Unit tests for retry classification matrix.
- Integration tests with mocked medicine API for transient and permanent failures.

Acceptance criteria:
- Worker retries transient failures up to configured attempts.
- Replayed executions do not create duplicates.

## 4.9 POST /pp/webapp/api/admin/medicine-imports/jobs/{jobId}/cancel
Purpose:
- Request cancellation for queued/running jobs.

Backend tasks:
- Validate cancellable states.
- Mark cancellation requested.
- Worker checks cancellation flag between row executions.
- Transition job to CANCELLED once safe stop achieved.

Test tasks:
- Cancellation of QUEUED job.
- Cancellation during RUNNING with partial progress.

Acceptance criteria:
- No new row execution starts after cancellation is acknowledged.

## 4.10 POST /pp/webapp/api/admin/medicine-imports/jobs/{jobId}/retry-failed
Purpose:
- Retry only FAILED_RETRYABLE (optionally selected) rows.

Backend tasks:
- Validate source job is PARTIAL_SUCCESS or FAILED.
- Select retryable rows and reset execution status to READY_RETRY.
- Enqueue retry run and increment attempt version.

Test tasks:
- Retry selection correctness test.
- End-to-end retry leading to improved success count.

Acceptance criteria:
- Retry run processes only eligible rows and updates summary counts.

## 4.11 GET /pp/webapp/api/admin/medicine-imports/jobs/{jobId}/events (SSE)
Purpose:
- Stream progress events for live UI updates.

Backend tasks:
- Implement SSE endpoint with auth and heartbeat.
- Publish events from worker for row and job transitions.
- Include replay cursor support for reconnects.

Test tasks:
- SSE connection and heartbeat test.
- Reconnect test with lastEventId.

Acceptance criteria:
- UI receives near real-time progress and final completion event.

## 5) Data and Persistence Tasks
- Add ImportJob, ImportRow, AuditEvent tables.
- Add indexes:
  - ImportRow(jobId, validationStatus)
  - ImportRow(jobId, executionStatus)
  - ImportRow(jobId, rowNumber)
- Add optimistic locking/version column for job transitions.
- Add retention strategy for old source files and audit events.

## 6) Frontend Implementation Tasks (Phase 1)
- Upload step with sheet and header row selection.
- Preview dashboard with counters and row grid filters.
- Inline correction for invalid rows.
- Approve/cancel/retry controls.
- Progress timeline with SSE updates.
- Final downloadable report (CSV/Excel) of failures.

## 7) QA Matrix (Minimum)
- Clean file with all valid rows.
- File with mixed valid/invalid rows.
- Duplicate medicine codes in same file.
- Invalid category code references.
- Worker retry exhaustion scenarios.
- Network interruptions during SSE stream.
- Cancellation during active processing.
- Idempotent replay of already processed rows.

## 8) Phase 1 Milestone Plan
### Milestone A: Foundations
- DB schema and enums
- upload endpoints
- workbook metadata parse

### Milestone B: Preview pipeline
- parse, map, validate
- job summary + row list APIs
- row override API

### Milestone C: Execution pipeline
- approve, queue, worker processing
- retry and cancel flows
- SSE progress events

### Milestone D: Hardening
- load tests and reliability tuning
- observability and alerts
- security checks and audit validation

## 9) Phase 1 Exit Acceptance Criteria
- At least 95 percent of valid rows in a 5k-row sample import succeed in a single run.
- Zero duplicate medicine creation on job retry or replay.
- Every failed row contains actionable error code and message.
- All state transitions captured in audit trail.
- Core endpoint integration tests pass in CI.

## 10) Risks and Mitigation in Phase 1
- Risk: poor source file quality.
  - Mitigation: strict template guidance and deterministic validations.
- Risk: partial execution complexity.
  - Mitigation: explicit state machine and idempotency keys.
- Risk: backend API rate/latency instability.
  - Mitigation: bounded concurrency, retry policy, stop-on-error threshold.
- Risk: user confusion in review screen.
  - Mitigation: clear error taxonomy and row-level fix hints.

## 11) Handover Checklist to Phase 2
- Capture mapping misses and override patterns for AI mapper training prompts.
- Baseline metrics from phase 1 workloads.
- Confirm policy for low-confidence AI suggestions.
- Confirm create-only versus upsert decision.
