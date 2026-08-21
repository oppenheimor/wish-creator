package com.wishcreator.todo;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

interface TodoRepository extends JpaRepository<Todo, UUID> {

    List<Todo> findAllByOrderByCreatedAtDesc();
}
