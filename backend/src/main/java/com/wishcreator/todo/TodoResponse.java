package com.wishcreator.todo;

import java.time.Instant;
import java.util.UUID;

record TodoResponse(
        UUID id,
        String title,
        boolean completed,
        Instant createdAt,
        Instant updatedAt
) {
    static TodoResponse from(Todo todo) {
        return new TodoResponse(
                todo.getId(),
                todo.getTitle(),
                todo.isCompleted(),
                todo.getCreatedAt(),
                todo.getUpdatedAt()
        );
    }
}
