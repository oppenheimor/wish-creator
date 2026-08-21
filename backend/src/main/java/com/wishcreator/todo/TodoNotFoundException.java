package com.wishcreator.todo;

import java.util.UUID;

public class TodoNotFoundException extends RuntimeException {

    TodoNotFoundException(UUID id) {
        super("Todo " + id + " was not found");
    }
}
