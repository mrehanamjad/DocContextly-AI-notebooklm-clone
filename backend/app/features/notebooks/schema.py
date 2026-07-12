from datetime import datetime
import uuid
from typing import Optional, Annotated
from pydantic import BaseModel, Field, ConfigDict, AfterValidator, model_validator

# 1. Define the logic EXACTLY ONCE
def check_not_blank(v: str) -> str:
    v = v.strip()
    if not v:
        raise ValueError('Title cannot be empty or just whitespace')
    return v

# 2. Create a reusable custom type combining the length rules and the validator
NonBlankTitle = Annotated[
    str, 
    Field(min_length=1, max_length=255), 
    AfterValidator(check_not_blank)
]


class NotebookCreate(BaseModel):
    title: NonBlankTitle
    description: Optional[str] = Field(None, max_length=5000)


class NotebookUpdate(BaseModel):
    title: Optional[NonBlankTitle] = None
    description: Optional[str] = Field(None, max_length=5000)

    @model_validator(mode='after')
    def check_at_least_one_field(self) -> 'NotebookUpdate':
        if self.title is None and self.description is None:
            raise ValueError('At least one field (title or description) must be provided for update.')
        return self


class NotebookResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    title: str
    description: Optional[str] = None
    source_count: Optional[int] = 0
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class NotebookListResponse(BaseModel):
    notebooks: list[NotebookResponse] 
    total: int
    page: int = Field(1, ge=1)
    size: int = Field(20, ge=1)
    has_more: bool = False