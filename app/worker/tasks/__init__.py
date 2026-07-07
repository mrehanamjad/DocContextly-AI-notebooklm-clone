"""Task registry for ARQ worker functions.

Each sub-module in this package defines task functions for a specific
domain (artifacts, sources, media).  This ``__init__`` re-exports them
into a flat list that ``WorkerSettings.functions`` consumes.
"""

from __future__ import annotations

from app.worker.tasks.artifacts import generate_text_artifact
from app.worker.tasks.media import generate_voice_overview
from app.worker.tasks.sources import index_source_job


TASK_FUNCTIONS: list = [
    generate_text_artifact,
    generate_voice_overview,
    index_source_job,
]
