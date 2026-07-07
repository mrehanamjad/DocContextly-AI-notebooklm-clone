"""ARQ worker package.

This package is the entry point for the background worker process.
It is started independently from the FastAPI web server::

    arq app.worker.main.WorkerSettings

The worker and the web app share the same ``app.core`` and ``app.features``
modules but run in separate OS processes with separate event loops.
"""
