package com.wishcreator.todo;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@Transactional(readOnly = true)
class TodoService {

    private final TodoRepository repository;

    TodoService(TodoRepository repository) {
        this.repository = repository;
    }

    List<TodoResponse> findAll() {
        return repository.findAllByOrderByCreatedAtDesc().stream()
                .map(TodoResponse::from)
                .toList();
    }

    TodoResponse findById(UUID id) {
        return TodoResponse.from(findTodo(id));
    }

    @Transactional
    TodoResponse create(CreateTodoRequest request) {
        Todo todo = new Todo(request.title().trim());
        return TodoResponse.from(repository.save(todo));
    }

    @Transactional
    TodoResponse update(UUID id, UpdateTodoRequest request) {
        Todo todo = findTodo(id);
        todo.update(request.title().trim(), request.completed());
        return TodoResponse.from(repository.saveAndFlush(todo));
    }

    @Transactional
    void delete(UUID id) {
        Todo todo = findTodo(id);
        repository.delete(todo);
    }

    private Todo findTodo(UUID id) {
        return repository.findById(id).orElseThrow(() -> new TodoNotFoundException(id));
    }
}
