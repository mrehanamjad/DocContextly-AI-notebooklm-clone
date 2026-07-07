"""Worker-specific exception hierarchy.

These exceptions control ARQ retry behaviour.  Task functions catch domain
errors and re-raise one of these to communicate intent to the worker loop:

    TransientWorkerError  →  ARQ will retry with exponential backoff.
    FatalWorkerError      →  No retry; mark the job as permanently failed.

Neither exception is tied to FastAPI — they work identically in the web
process and the worker process.
"""

from __future__ import annotations

from arq import Retry


class WorkerException(Exception):
    """Base exception for all worker-related errors."""

    def __init__(self, message: str, details: dict | None = None):
        self.message = message
        self.details = details or {}
        super().__init__(message)


class TransientWorkerError(WorkerException):
    """Raise when a task hits a *recoverable* failure (rate limit, timeout, etc.).

    The caller should catch this and raise ``arq.Retry`` with a suitable
    ``defer`` value.  A helper is provided below.

    Attributes:
        defer_seconds: Suggested backoff time in seconds (per-retry attempt).
    """

    def __init__(
        self,
        message: str,
        defer_seconds: int = 15,
        details: dict | None = None,
    ):
        self.defer_seconds = defer_seconds
        super().__init__(message, details)


class FatalWorkerError(WorkerException):
    """Raise when a task hits an *unrecoverable* failure.

    The worker will NOT retry.  The task function is responsible for
    persisting the error (e.g. updating the DB row to ERROR status)
    before raising this.
    """


# ── Retry helper ──────────────────────────────────────────────────────────────

MAX_WORKER_RETRIES = 3


def handle_transient_error(
    error: TransientWorkerError,
    job_try: int,
) -> None:
    """Decide whether to retry or give up based on current attempt.

    Call this inside a task's ``except TransientWorkerError`` block::

        except TransientWorkerError as e:
            handle_transient_error(e, ctx["job_try"])

    If retries remain it raises ``arq.Retry`` (which ARQ catches and
    reschedules the job).  If retries are exhausted it re-raises the
    original error so the task's outer ``except`` can mark it as failed.
    """
    if job_try < MAX_WORKER_RETRIES:
        backoff = error.defer_seconds * job_try
        raise Retry(defer=backoff)

    # Out of retries — let the caller's outer except handle permanent failure.
    raise error
