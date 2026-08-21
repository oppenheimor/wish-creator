package com.wishcreator.todo;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

record CreateTodoRequest(
        @NotBlank(message = "Title must not be blank")
        @Size(max = 200, message = "Title must be at most 200 characters")
        String title
) {
}
